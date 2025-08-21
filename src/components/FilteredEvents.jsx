// src/components/FilteredEvents.jsx
import React from "react";
import Product from "./Product"; // Kart bileşeni

const FilteredEvents = ({ events }) => {
  if (!events.length) return null;

  return (
    <div className="filtered-events">
      <h3>Filtrelenmiş Etkinlikler</h3>
      <ul id="products">
        {events.map((event) => (
          <li key={event.id}>
            <Product {...event} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilteredEvents;
