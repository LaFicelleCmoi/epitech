import { getUserRoleInServerService } from "../Models/ServerModel.js";

export const checkRole = (rolesAutorises = []) => {
  return async (req, res, next) => {
    try {
      const serverId = req.params.serverId;
      const userId = req.user.id;

      if (!serverId) return res.status(400).json({ message: "Server ID missing" });

      const roleData = await getUserRoleInServerService(serverId, userId);

      if (!roleData)
        return res.status(403).json({ message: "You are not a member of this server" });

      const userRole = roleData.role;

      if (!rolesAutorises.includes(userRole)) {
        return res.status(403).json({ message: `Required role: ${rolesAutorises.join(", ")}` });
      }

      req.userRole = userRole;
      next();
    } catch (err) {
      next(err);
    }
  };
};