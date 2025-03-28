/**
 * Centralisation des appels API avec utilisation de la variable d'environnement
 */

// Récupération de l'URL du backend depuis la variable d'environnement
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fonction pour effectuer des requêtes GET
 * @param endpoint - Le point de terminaison API (sans l'URL de base)
 */
export async function fetchApi(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Fonction pour effectuer des requêtes POST
 * @param endpoint - Le point de terminaison API (sans l'URL de base)
 * @param data - Les données à envoyer
 */
export async function postApi(endpoint: string, data: any) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  
  return await response.json();
}