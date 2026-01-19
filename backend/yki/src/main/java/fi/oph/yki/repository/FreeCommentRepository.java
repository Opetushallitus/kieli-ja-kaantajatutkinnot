package fi.oph.yki.repository;

import fi.oph.yki.model.FreeComment;
import fi.oph.yki.model.FreeRegistration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FreeCommentRepository extends JpaRepository<FreeComment, Long> {}
