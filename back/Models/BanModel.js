import pool from "../Config/DataBase.js";

// Auto-create bans table if it doesn't exist
export const ensureBansTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bans (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL,
      server_id UUID NOT NULL,
      banned_by UUID NOT NULL,
      reason TEXT,
      is_permanent BOOLEAN NOT NULL DEFAULT true,
      expires_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
      FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT unique_user_ban UNIQUE (user_id, server_id)
    )
  `);
};

export const createBanService = async (userId, serverId, bannedBy, reason, isPermanent, expiresAt) => {
  const result = await pool.query(
    `INSERT INTO bans (user_id, server_id, banned_by, reason, is_permanent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, server_id) DO UPDATE
     SET banned_by = $3, reason = $4, is_permanent = $5, expires_at = $6, created_at = NOW()
     RETURNING *`,
    [userId, serverId, bannedBy, reason, isPermanent, expiresAt]
  );
  return result.rows[0];
};

export const removeBanService = async (userId, serverId) => {
  const result = await pool.query(
    `DELETE FROM bans WHERE user_id = $1 AND server_id = $2 RETURNING *`,
    [userId, serverId]
  );
  return result.rows[0];
};

export const isUserBannedService = async (userId, serverId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM bans WHERE user_id = $1 AND server_id = $2`,
      [userId, serverId]
    );
    if (result.rows.length === 0) return null;

    const ban = result.rows[0];

    // If temporary ban has expired, remove it
    if (!ban.is_permanent && ban.expires_at && new Date(ban.expires_at) < new Date()) {
      await removeBanService(userId, serverId);
      return null;
    }

    return ban;
  } catch (err) {
    // Table doesn't exist yet — not banned
    return null;
  }
};

export const getBansByServerService = async (serverId) => {
  const result = await pool.query(
    `SELECT b.*, u.name, u.first_name
     FROM bans b
     JOIN users u ON b.user_id = u.id
     WHERE b.server_id = $1
     ORDER BY b.created_at DESC`,
    [serverId]
  );
  return result.rows;
};
