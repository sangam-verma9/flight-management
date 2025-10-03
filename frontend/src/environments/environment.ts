const production = false;
export const environment = {
    production: production,
    apiUrl: production ? 'https://flight-management-xo9z.onrender.com/api/v1' : 'http://localhost:8000/api/v1'
};