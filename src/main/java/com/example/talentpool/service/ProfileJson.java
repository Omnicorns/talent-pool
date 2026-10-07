package com.example.talentpool.service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
@Component
public class ProfileJson {
    private final ObjectMapper mapper;
    public ProfileJson(ObjectMapper mapper) { this.mapper = mapper; }
    public String write(Object value) {
        try { return mapper.writeValueAsString(value); }
        catch (JsonProcessingException ex) { throw new IllegalStateException("Data profil tidak dapat disimpan", ex); }
    }
    public <T> T read(String value, Class<T> type) {
        if (value == null || value.isBlank()) return null;
        try { return mapper.readValue(value, type); }
        catch (JsonProcessingException ex) { throw new IllegalStateException("Data profil tidak dapat dibaca", ex); }
    }
    public <T> T read(String value, TypeReference<T> type) {
        try { return mapper.readValue(value, type); }
        catch (JsonProcessingException ex) { throw new IllegalStateException("Data profil tidak dapat dibaca", ex); }
    }
}
