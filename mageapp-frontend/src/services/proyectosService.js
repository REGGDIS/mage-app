import apiClient from "./apiClient.js";

const PROJECT_NAME = "Aplicación propia - MageApp";

const getEncodedProjectName = () => encodeURIComponent(PROJECT_NAME);

export const getModeloDeValor = async () => {
    const nombre = getEncodedProjectName();
    const response = await apiClient.get(
        `/api/proyectos/${nombre}/modelodevalor`,
        {
            params: { like: 1 },
        }
    );
    return response.data;
};

export const getMatrizDeRiesgo = async () => {
    const nombre = getEncodedProjectName();
    const response = await apiClient.get(
        `/api/proyectos/${nombre}/matrizderiesgo`,
        {
            params: { like: 1 },
        }
    );
    return response.data;
};

export const getMapaDeRiesgos = async () => {
    const nombre = getEncodedProjectName();
    const response = await apiClient.get(
        `/api/proyectos/${nombre}/mapaderiesgos`,
        {
            params: { like: 1 },
        }
    );
    return response.data;
};
