package com.example.talentpool.dto;
import jakarta.validation.constraints.*;
import java.util.List;
public record WorkDetails(
    @Size(max=50) String employmentType, @Size(max=150) String industry,
    @Size(max=20) List<@NotBlank @Size(max=150) String> skills,
    @Size(max=20) List<@NotBlank @Size(max=150) String> tools,
    @Size(max=4000) String resignReason
) {}
