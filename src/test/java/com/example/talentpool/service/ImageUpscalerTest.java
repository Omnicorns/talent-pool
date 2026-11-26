package com.example.talentpool.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class ImageUpscalerTest {
    @TempDir Path dir;

    private Path image(String name, int w, int h, int type, String format) throws Exception {
        Path file = dir.resolve(name);
        ImageIO.write(new BufferedImage(w, h, type), format, file.toFile());
        return file;
    }

    @Test
    void fotoKecilDiperbesarSampaiTigaKali() throws Exception {
        Path file = image("kecil.jpg", 600, 400, BufferedImage.TYPE_INT_RGB, "jpg");

        assertThat(ImageUpscaler.upscaleIfSmall(file, "jpg")).isTrue();

        BufferedImage result = ImageIO.read(file.toFile());
        assertThat(result.getWidth()).isEqualTo(1800);
        assertThat(result.getHeight()).isEqualTo(1200);
    }

    @Test
    void fotoSedangDiperbesarSampaiTarget() throws Exception {
        Path file = image("sedang.jpg", 1000, 500, BufferedImage.TYPE_INT_RGB, "jpg");

        ImageUpscaler.upscaleIfSmall(file, "jpeg");

        assertThat(ImageIO.read(file.toFile()).getWidth()).isEqualTo(ImageUpscaler.TARGET_LONG_SIDE);
    }

    @Test
    void fotoBesarTidakDiubah() throws Exception {
        Path file = image("besar.jpg", 2000, 1200, BufferedImage.TYPE_INT_RGB, "jpg");
        byte[] before = Files.readAllBytes(file);

        assertThat(ImageUpscaler.upscaleIfSmall(file, "jpg")).isFalse();
        assertThat(Files.readAllBytes(file)).isEqualTo(before);
    }

    @Test
    void pngTransparanTetapTransparan() throws Exception {
        Path file = image("logo.png", 300, 100, BufferedImage.TYPE_INT_ARGB, "png");

        assertThat(ImageUpscaler.upscaleIfSmall(file, "png")).isTrue();
        assertThat(ImageIO.read(file.toFile()).getColorModel().hasAlpha()).isTrue();
    }

    @Test
    void fileRusakDibiarkanApaAdanya() throws Exception {
        Path file = dir.resolve("rusak.jpg");
        Files.write(file, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 1, 2, 3});

        assertThat(ImageUpscaler.upscaleIfSmall(file, "jpg")).isFalse();
        assertThat(Files.size(file)).isEqualTo(6);
    }

    @Test
    void webpDilewati() throws Exception {
        Path file = dir.resolve("foto.webp");
        Files.write(file, new byte[]{1, 2, 3});

        assertThat(ImageUpscaler.upscaleIfSmall(file, "webp")).isFalse();
    }
}
