import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
        error: "",
      };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };

    case "rejected":
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const BASE_URL =
    "https://worldwisw-default-rtdb.europe-west1.firebasedatabase.app";

  // 🟢 تحميل جميع المدن
  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });

      try {
        const res = await fetch(`${BASE_URL}/cities.json`);
        const data = await res.json();

        if (!data) {
          dispatch({ type: "cities/loaded", payload: [] });
          return;
        }

        const citiesArray = Object.entries(data).map(([index, city]) => ({
          index,
          ...city,
        }));

        dispatch({ type: "cities/loaded", payload: citiesArray });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities data",
        });
      }
    }

    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (id === currentCity.id) return;

      dispatch({ type: "loading" });

      try {
        const res = await fetch(`${BASE_URL}/cities.json`);
        const data = await res.json();

        const entry = Object.entries(data).find(
          ([key, city]) => city.id === id
        );

        if (!entry)
          return dispatch({
            type: "rejected",
            payload: "City not found",
          });

        const [index, cityData] = entry;

        dispatch({ type: "city/loaded", payload: { index, ...cityData } });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading city data",
        });
      }
    },
    [currentCity.id]
  );

  // 🟢 إنشاء مدينة جديدة
  async function createCity(newCity) {
    dispatch({ type: "loading" });

    try {
      const res = await fetch(`${BASE_URL}/cities.json`);
      const data = await res.json();

      const newIndex = data ? Object.keys(data).length : 0;

      const cityWithId = {
        id: newCity.id || Date.now(),
        ...newCity,
      };

      await fetch(`${BASE_URL}/cities/${newIndex}.json`, {
        method: "PUT",
        body: JSON.stringify(cityWithId),
        headers: {
          "Content-Type": "application/json",
        },
      });

      dispatch({ type: "city/created", payload: cityWithId });
    } catch (error) {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city data",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });

    try {
      const res = await fetch(`${BASE_URL}/cities.json`);
      const data = await res.json();

      if (!data) throw new Error("No data found");

      const entry = Object.entries(data).find(([key, city]) => city.id === id);

      if (!entry) throw new Error("City not found");

      const [indexToDelete] = entry;

      await fetch(`${BASE_URL}/cities/${indexToDelete}.json`, {
        method: "DELETE",
      });

      dispatch({ type: "city/deleted", payload: id });
    } catch (err) {
      console.error(err);
      dispatch({
        type: "rejected",
        payload: "There was an error deleting city data",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside of CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
