package com.example.talentpool.service;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.GZIPInputStream;
@Service
public class PostalCodeService {
    private final Map<String,List<String>> regions=new HashMap<>();
    public PostalCodeService() {
        try (var reader=new BufferedReader(new InputStreamReader(new GZIPInputStream(new ClassPathResource("data/postal-codes.tsv.gz").getInputStream()), StandardCharsets.UTF_8))) {
            reader.lines().forEach(line -> { String[] parts=line.split("\t",2); regions.computeIfAbsent(parts[0], k -> new ArrayList<>()).add(parts[1]); });
            regions.replaceAll((key,value) -> value.stream().distinct().sorted().toList());
        } catch(IOException ex) { throw new IllegalStateException("Data kode pos tidak dapat dibaca",ex); }
    }
    public List<String> search(String code) { return code!=null && code.matches("[0-9]{5}") ? regions.getOrDefault(code,List.of()) : List.of(); }
}
