import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";




const swaggerSpec = swaggerJSDoc({
    definition: {
            openapi: "3.0.3",
            info: {
            title: "My API",
            version: "1.0.0"
        },
        servers: [
            {
                url: process.env.NODE_ENV === "production"
                ? "https://redbeapi-bmere9etc3c8eva6.canadacentral-01.azurewebsites.net"
                : "http://localhost:3000"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
    },
    apis: [
        "./userRoutes.js",
        "./welfareRoutes.js",
        "./membersRoutes.js",
        "./householdRoutes.js",
        "./emailRoute.js",
        "./attendanceRoutes.js"
    ]
});

export function setupSwagger(app) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


