package com.example.talentpool.event;

import java.util.UUID;

/** Diterbitkan saat sebuah lowongan pertama kali berstatus PUBLISHED. */
public record JobListingPublishedEvent(UUID jobListingId) {}
