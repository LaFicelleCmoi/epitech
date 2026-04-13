import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ChatFlow API",
      version: "2.0.0",
      description: "Documentation complète de l'API backend ChatFlow — messagerie temps réel, serveurs, modération, DM, amis.",
    },
    servers: [
      { url: "http://localhost:3001", description: "Serveur local" }
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
    tags: [
      { name: "Auth", description: "Authentification et profil utilisateur" },
      { name: "Servers", description: "Gestion des serveurs" },
      { name: "Channels", description: "Gestion des channels" },
      { name: "Messages", description: "Messagerie (channels)" },
      { name: "Moderation", description: "Kick, ban, unban" },
      { name: "Conversations", description: "Messages privés (DM)" },
      { name: "Friends", description: "Système d'amis" },
    ]
  },
  apis: [path.resolve("./Routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
