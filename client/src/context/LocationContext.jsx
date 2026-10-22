import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
  TAMIL_NADU_DISTRICTS,
  ALL_TAMIL_NADU_LOCALITIES,
  LEGACY_SALEM_LOCALITIES,
  getCoordinatesForLocation,
} from '../data/tamilNaduLocations';

const LocationContext = createContext();

// Backward compatibility alias for any component still importing salemLocalitiesList
export const salemLocalitiesList = ALL_TAMIL_NADU_LOCALITIES;

export const LocationProvider = ({ children }) => {
  const [currentLocality, setCurrentLocality] = useState(() => {
    return localStorage.getItem('foodswift_locality') || 'Fairlands, Salem';
  });

  const [currentDistrict, setCurrentDistrict] = useState(() => {
    return localStorage.getItem('foodswift_district') || 'Salem';
  });

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    localStorage.setItem('foodswift_locality', currentLocality);
    localStorage.setItem('foodswift_district', currentDistrict);
  }, [currentLocality, currentDistrict]);

  const selectLocality = (locality, districtName) => {
    setCurrentLocality(locality);
    if (districtName) {
      setCurrentDistrict(districtName);
    } else {
      // Try to infer district from locality string (e.g. "T. Nagar, Chennai")
      for (const d of TAMIL_NADU_DISTRICTS) {
        if (locality.includes(d.name)) {
          setCurrentDistrict(d.name);
          break;
        }
      }
    }
    setLocationModalOpen(false);
  };

  const selectDistrict = (districtName) => {
    const d = TAMIL_NADU_DISTRICTS.find((item) => item.name === districtName);
    if (d && d.localities.length > 0) {
      setCurrentDistrict(d.name);
      setCurrentLocality(`${d.localities[0]}, ${d.name}`);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setSavedAddresses(res.data.data);
      }
    } catch (e) {
      // not logged in
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocality,
        currentDistrict,
        selectLocality,
        selectDistrict,
        locationModalOpen,
        setLocationModalOpen,
        localities: ALL_TAMIL_NADU_LOCALITIES,
        districts: TAMIL_NADU_DISTRICTS,
        salemLocalities: LEGACY_SALEM_LOCALITIES,
        getCoordinates: getCoordinatesForLocation,
        savedAddresses,
        fetchSavedAddresses,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
