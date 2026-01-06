import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Mantiene el título del documento consistente en toda la app.
 * Se ejecuta en cada cambio de ruta.
 */
export default function TitleSync() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Weather Platform';
  }, [location.pathname]);

  return null;
}

