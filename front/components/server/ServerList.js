'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateServerModal from "../modal/CreateServerModal";

export default function ServerList({ onServerSelect, isInline, unreadChannels = {} }) {
  const [servers, setServers] = useState([]);
  const [serverChannels, setServerChannels] = useState({}); // { serverId: [channelId, ...] }
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchServers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/servers/members", {
          headers: { Authorization: "Bearer " + token }
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        const fetchedServers = data.data || [];
        setServers(fetchedServers);

        // Fetch channels for each server to map channelId -> serverId
        const channelMap = {};
        for (const server of fetchedServers) {
          try {
            const chRes = await fetch(`http://localhost:3001/servers/${server.id}/channels`, {
              headers: { Authorization: "Bearer " + token }
            });
            if (chRes.ok) {
              const chData = await chRes.json();
              channelMap[server.id] = (chData.data || []).map(c => c.id);
            }
          } catch (e) {}
        }
        setServerChannels(channelMap);
      } catch (err) {
        console.error(err);
      }
    };

    fetchServers();
  }, [router]);

  const getServerUnread = (serverId) => {
    const channelIds = serverChannels[serverId] || [];
    return channelIds.reduce((sum, chId) => sum + (unreadChannels[chId] || 0), 0);
  };

  const renderServer = (server) => {
    const unread = getServerUnread(server.id);
    return (
      <div
        key={server.id}
        className="server-icon"
        onClick={() => onServerSelect(server)}
        title={server.name}
        style={{ position: 'relative' }}
      >
        {server.name?.[0]}
        {unread > 0 && (
          <span className="server-unread-badge">{unread}</span>
        )}
      </div>
    );
  };

  if (isInline) {
    return (
      <>
        {servers.map(renderServer)}
        <div className="add-server" onClick={() => setIsModalOpen(true)}>+</div>
        <CreateServerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onServerCreated={(server) => setServers(prev => [...prev, server])}
        />
      </>
    );
  }

  return (
    <div className="server-list">
      {servers.map(renderServer)}
      <div className="add-server" onClick={() => setIsModalOpen(true)}>+</div>
      <CreateServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onServerCreated={(server) => setServers(prev => [...prev, server])}
      />
    </div>
  );
}
