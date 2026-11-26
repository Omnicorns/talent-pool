package com.example.talentpool.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;

/**
 * Memperbesar foto situs yang resolusinya kecil agar tidak pecah/buram saat ditampilkan besar
 * (mis. carousel Life at Sarinah). Diperbesar bertahap dengan bicubic lalu dipertajam ringan.
 *
 * <p>Ini bukan AI upscaler: detail yang tidak ada di foto asli tidak bisa dibuat. Hasilnya lebih
 * halus daripada foto kecil yang diperbesar browser, tetapi foto asli beresolusi tinggi tetap
 * memberi hasil terbaik. Bila apa pun gagal (format tidak didukung, CMYK, dll.), file asli dibiarkan.
 */
final class ImageUpscaler {
    private static final Logger log = LoggerFactory.getLogger(ImageUpscaler.class);

    /** Sisi terpanjang minimal yang dianggap sudah cukup tajam; foto di bawah ini diperbesar. */
    static final int MIN_LONG_SIDE = 1600;
    /** Target sisi terpanjang setelah diperbesar. */
    static final int TARGET_LONG_SIDE = 1920;
    /** Batas pembesaran; lebih dari ini hasilnya justru makin buram. */
    static final double MAX_FACTOR = 3.0;
    private static final double STEP = 1.5;
    private static final float JPEG_QUALITY = 0.92f;

    private ImageUpscaler() {
    }

    /** Perbesar file gambar di tempat bila perlu. Mengembalikan true jika file diubah. */
    static boolean upscaleIfSmall(Path file, String extension) {
        String ext = extension.toLowerCase(java.util.Locale.ROOT);
        boolean jpeg = ext.equals("jpg") || ext.equals("jpeg");
        boolean png = ext.equals("png");
        if (!jpeg && !png) return false; // webp tidak didukung ImageIO bawaan

        try {
            int[] size = readSize(file);
            if (size == null) return false;
            int longSide = Math.max(size[0], size[1]);
            if (longSide <= 0 || longSide >= MIN_LONG_SIDE) return false;

            double factor = Math.min((double) TARGET_LONG_SIDE / longSide, MAX_FACTOR);
            if (factor < 1.15) return false;

            BufferedImage source = ImageIO.read(file.toFile());
            if (source == null) return false;

            boolean alpha = png && source.getColorModel().hasAlpha();
            int type = alpha ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
            int targetW = (int) Math.round(source.getWidth() * factor);
            int targetH = (int) Math.round(source.getHeight() * factor);

            BufferedImage current = convert(source, type);
            while (current.getWidth() < targetW) {
                int nextW = Math.min(targetW, (int) Math.ceil(current.getWidth() * STEP));
                int nextH = nextW == targetW ? targetH
                        : (int) Math.round(current.getHeight() * (nextW / (double) current.getWidth()));
                current = scale(current, nextW, nextH, type);
            }
            current = sharpen(current);

            Path temp = Files.createTempFile(file.getParent(), "upscale-", "." + ext);
            try {
                if (jpeg) writeJpeg(current, temp);
                else ImageIO.write(current, "png", temp.toFile());
                Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } finally {
                Files.deleteIfExists(temp);
            }
            log.info("Foto {} diperbesar {}x{} -> {}x{}", file.getFileName(), size[0], size[1], targetW, targetH);
            return true;
        } catch (Exception | OutOfMemoryError ex) {
            log.warn("Foto {} tidak diperbesar, file asli dipakai: {}", file.getFileName(), ex.toString());
            return false;
        }
    }

    /** Baca dimensi tanpa men-decode seluruh gambar (aman dari gambar berdimensi raksasa). */
    private static int[] readSize(Path file) throws java.io.IOException {
        try (ImageInputStream in = ImageIO.createImageInputStream(file.toFile())) {
            if (in == null) return null;
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) return null;
            ImageReader reader = readers.next();
            try {
                reader.setInput(in, true, true);
                return new int[]{reader.getWidth(0), reader.getHeight(0)};
            } finally {
                reader.dispose();
            }
        }
    }

    private static BufferedImage convert(BufferedImage src, int type) {
        if (src.getType() == type) return src;
        BufferedImage out = new BufferedImage(src.getWidth(), src.getHeight(), type);
        Graphics2D g = out.createGraphics();
        try {
            if (type == BufferedImage.TYPE_INT_RGB) {
                g.setColor(java.awt.Color.WHITE);
                g.fillRect(0, 0, src.getWidth(), src.getHeight());
            }
            g.drawImage(src, 0, 0, null);
        } finally {
            g.dispose();
        }
        return out;
    }

    private static BufferedImage scale(BufferedImage src, int w, int h, int type) {
        BufferedImage out = new BufferedImage(w, h, type);
        Graphics2D g = out.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_COLOR_RENDERING, RenderingHints.VALUE_COLOR_RENDER_QUALITY);
            g.drawImage(src, 0, 0, w, h, null);
        } finally {
            g.dispose();
        }
        return out;
    }

    /** Penajaman ringan (unsharp sederhana) untuk mengembalikan kontras tepi setelah diperbesar. */
    private static BufferedImage sharpen(BufferedImage src) {
        float a = 0.18f;
        float[] kernel = {
                0, -a, 0,
                -a, 1 + 4 * a, -a,
                0, -a, 0
        };
        BufferedImage out = new BufferedImage(src.getWidth(), src.getHeight(), src.getType());
        new ConvolveOp(new Kernel(3, 3, kernel), ConvolveOp.EDGE_NO_OP, null).filter(src, out);
        return out;
    }

    private static void writeJpeg(BufferedImage image, Path target) throws java.io.IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
        if (!writers.hasNext()) throw new java.io.IOException("JPEG writer tidak tersedia");
        ImageWriter writer = writers.next();
        try (ImageOutputStream out = ImageIO.createImageOutputStream(target.toFile())) {
            writer.setOutput(out);
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(JPEG_QUALITY);
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
    }
}
