package com.example.talentpool.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class PasswordPolicyTest {
    @Test
    void acceptsUniquePassword() {
        assertNull(PasswordPolicy.violation("Kuda!Biru77xx", "budi@example.com", "Budi Santoso"));
        assertNull(PasswordPolicy.violation("TestSecret123!", "a@example.com", "Test Kandidat"));
    }

    @Test
    void rejectsWeakPasswords() {
        assertNotNull(PasswordPolicy.violation("Short1A", "a@b.com", "A"));
        assertNotNull(PasswordPolicy.violation("alllowercase1", "a@b.com", "A"));
        assertNotNull(PasswordPolicy.violation("Sarinah123", "a@b.com", "A"));
        assertNotNull(PasswordPolicy.violation("Qwerty12345A", "a@b.com", "A"));
        assertNotNull(PasswordPolicy.violation("AaaaaaaaaaA1", "a@b.com", "A"));
    }

    @Test
    void rejectsPasswordContainingEmailOrName() {
        assertNotNull(PasswordPolicy.violation("pelamar-ujiX9", "pelamar-uji@example.com", "Z"));
        assertNotNull(PasswordPolicy.violation("SantosoKuda77", "x@y.com", "Budi Santoso"));
    }
}
