package fi.oph.akt.onr.model.contactDetails;

@FunctionalInterface
public interface Setter<T, E> {

	void set(T obj, E value);

}
