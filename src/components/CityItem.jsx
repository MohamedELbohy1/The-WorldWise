import { Link } from "react-router-dom";
import styles from "./CityItem.module.css";
import { useCities } from "../contexts/CitiesContext";

const formatDate = (date) => {
  if (!date) return ""; // لو مفيش تاريخ

  const d = date?.toDate ? date.toDate() : new Date(date);

  if (isNaN(d)) return ""; // لو التاريخ غير صالح

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(d);
};

function CityItem({ city }) {
  const { currentCity, deleteCity } = useCities();
  const { cityName, emoji, date, id } = city;

  const lat = city?.position?.lat;
  const lng = city?.position?.lng;

  function handleClick(e) {
    e.preventDefault();
    deleteCity(id);
  }

  return (
    <li>
      <Link
        className={`${styles.cityItem} ${
          city.id === currentCity?.id ? styles["cityItem--active"] : ""
        }`}
        to={`${id}?lat=${Number(lat)}&lng=${Number(lng)}`}
      >
        <span className={styles.emoji}>{emoji}</span>
        <h3 className={styles.name}>{cityName}</h3>
        {/* عرض التاريخ بس لو موجود */}
        {date && <time className={styles.date}>{formatDate(date)}</time>}
        <button className={styles.deleteBtn} onClick={handleClick}>
          &times;
        </button>
      </Link>
    </li>
  );
}

export default CityItem;
