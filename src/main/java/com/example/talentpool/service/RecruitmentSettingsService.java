package com.example.talentpool.service;

import com.example.talentpool.domain.RecruitmentSetting;
import com.example.talentpool.dto.RecruitmentSettingsRequest;
import com.example.talentpool.dto.RecruitmentSettingsResponse;
import com.example.talentpool.exception.BadRequestException;
import com.example.talentpool.repository.RecruitmentSettingRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.ZoneId;

@Service
public class RecruitmentSettingsService {
    private final RecruitmentSettingRepository repository;

    public RecruitmentSettingsService(RecruitmentSettingRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public RecruitmentSettingsResponse get() {
        return toResponse(repository.findById(RecruitmentSetting.SINGLETON_ID)
                .orElseGet(() -> repository.save(new RecruitmentSetting())));
    }

    @Transactional
    public RecruitmentSettingsResponse update(RecruitmentSettingsRequest request) {
        validateTimezone(request.timezone());
        RecruitmentSetting setting = repository.findById(RecruitmentSetting.SINGLETON_ID)
                .orElseGet(RecruitmentSetting::new);
        setting.setCompanyName(request.companyName().trim());
        setting.setDefaultInterviewDuration(request.defaultInterviewDuration());
        setting.setTimezone(request.timezone().trim());
        setting.setEmailNotifications(request.emailNotifications());
        setting.setCandidateAutoArchiveDays(request.candidateAutoArchiveDays());
        return toResponse(repository.save(setting));
    }

    private void validateTimezone(String timezone) {
        try {
            ZoneId.of(timezone.trim());
        } catch (DateTimeException ex) {
            throw new BadRequestException("Timezone tidak valid: " + timezone);
        }
    }

    private RecruitmentSettingsResponse toResponse(RecruitmentSetting setting) {
        return new RecruitmentSettingsResponse(
                setting.getCompanyName(), setting.getDefaultInterviewDuration(), setting.getTimezone(),
                setting.isEmailNotifications(), setting.getCandidateAutoArchiveDays(), setting.getUpdatedAt()
        );
    }
}
