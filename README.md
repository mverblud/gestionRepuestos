# Gestión de Repuestos
## Ejecutar en desarrollo!

1. Clonar el repositorio
2. Ejecutar
```
npm install
```
3. Clonar el archivo ```.env.template``` y renombrar la copia a ```.env```

4. Llenar las variables de entorno definidas en el ```.env```

5. Ejecutar la aplicación en dev:
```
npm run dev
```
6. Ejecutar seeder(categories, productBrands, carBrands, providers) :
```
npm run db:importar
```
7. Eliminar data(categories, productBrands, carBrands, providers, products) :
```
npm run db:eliminar
```
8. Insertar products a travez de /api/uploads enviando como parametro el archivo: (Google Drive)
```
Lista de Productos.csv
```
9. Insertar precios a travez de /api/uploads/update-prices/:id enviando como parametro

### Stack usado
* Typescript
* Mongo DB
* Express
* Mongose

## Build

```
docker-compose -f docker-compose.prod.yaml --env-file .env.prod up --build
```

## Run
```
docker-compose -f docker-compose.prod.yaml --env-file .env.prod up
```


