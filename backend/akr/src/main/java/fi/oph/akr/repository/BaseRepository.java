package fi.oph.akr.repository;

import fi.oph.akr.util.exception.NotFoundException;
import java.util.List;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseRepository<T> extends JpaRepository<T, Long> {
  /**
   * Overwrites `deleteById` defined by `CrudRepository`. Deletion is done via
   * `deleteAllByIdInBatch` because overwritten `deleteById` doesn't seem functional with
   * HSQL test database.
   *
   * @param id must not be {@literal null}.
   */
  @Override
  default void deleteById(final @NonNull Long id) {
    if (!this.existsById(id)) {
      throw new NotFoundException(String.format("Entity by id: %d not found", id));
    }

    this.deleteAllByIdInBatch(List.of(id));
  }
}
