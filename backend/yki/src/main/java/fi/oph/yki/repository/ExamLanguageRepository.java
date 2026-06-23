package fi.oph.yki.repository;

import fi.oph.yki.model.ExamLanguage;
import fi.oph.yki.model.Organizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamLanguageRepository extends JpaRepository<ExamLanguage, Long> {
  @Modifying
  @Query("DELETE FROM ExamLanguage el WHERE el.organizer = :organizer")
  void deleteAllByOrganizer(@Param("organizer") Organizer organizer);
}
