# Next.js GComunes App
Para correr localmente se necesita la base de datos
```
docker-compose up -d
```
* el -d significa __detached__
* MongoDB URL Local:
```
mongodb://localhost:27017/gcdb
```
# Configurar las  varrrales de entorno
Renombrar el archivo __.env.template__ a __.env

# Llenar la BD con datos de prueba:
 ```
 http://localhost:3000/api/seed