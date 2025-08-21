import React, { createContext, useContext, useState, useEffect } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as aiIdl } from "./declarations/ai";
import { idlFactory as blogIdl } from "./declarations/blog";
import { idlFactory as chiliIdl } from "./declarations/chili";
import { idlFactory as gameIdl } from "./declarations/game";
import { idlFactory as membershipIdl } from "./declarations/membership";
import { idlFactory as portalIdl } from "./declarations/portal";
import { idlFactory as profileIdl } from "./declarations/profile";
import { idlFactory as shopIdl } from "./declarations/shop";
import { idlFactory as userIdl } from "./declarations/user";
import { idlFactory as wallet2Idl } from "./declarations/wallet2";
import { idlFactory as whitepaperIdl } from "./declarations/whitepaper";
import { AuthClient } from '@dfinity/auth-client';
import { CANISTER_IDS, ADMIN_PRINCIPALS } from './config';

export const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [principal, setPrincipal] = useState(null);
  const [plugConnected, setPlugConnected] = useState(false);
  const [agent, setAgent] = useState(null);
  const [canisters, setCanisters] = useState({});
  const [iiPrincipal, setIiPrincipal] = useState(null);
  const [iiLoggedIn, setIiLoggedIn] = useState(false);
  const [authClient, setAuthClient] = useState(null);

  // Initialize canister actors
  const initializeCanisters = (agent) => {
    const canisterActors = {};
    
    Object.keys(CANISTER_IDS).forEach(canisterName => {
      const canisterId = CANISTER_IDS[canisterName];
      let idlFactory;
      
      switch(canisterName) {
        case 'ai': idlFactory = aiIdl; break;
        case 'blog': idlFactory = blogIdl; break;
        case 'chili': idlFactory = chiliIdl; break;
        case 'game': idlFactory = gameIdl; break;
        case 'membership': idlFactory = membershipIdl; break;
        case 'portal': idlFactory = portalIdl; break;
        case 'profile': idlFactory = profileIdl; break;
        case 'shop': idlFactory = shopIdl; break;
        case 'user': idlFactory = userIdl; break;
        case 'wallet2': idlFactory = wallet2Idl; break;
        case 'whitepaper': idlFactory = whitepaperIdl; break;
        default: return;
      }
      
      canisterActors[canisterName] = Actor.createActor(idlFactory, {
        agent,
        canisterId
      });
    });
    
    setCanisters(canisterActors);
  };

  async function connectPlug() {
    if (!window.ic || !window.ic.plug) {
      alert("Plug wallet not found! Please install the Plug extension.");
      return;
    }
    
    try {
      const connected = await window.ic.plug.requestConnect();
      if (connected) {
        const principal = await window.ic.plug.getPrincipal();
        setPrincipal(principal.toString());
        setPlugConnected(true);
        
        // Create agent with Plug
        const agent = await window.ic.plug.createAgent({
          host: "http://127.0.0.1:4943"
        });
        setAgent(agent);
        
        // Initialize canister actors
        initializeCanisters(agent);
        
        return principal;
      } else {
        alert("Plug connection rejected.");
      }
    } catch (e) {
      alert("Plug connection failed: " + e.message);
    }
  }

  async function disconnectPlug() {
    if (window.ic && window.ic.plug) {
      await window.ic.plug.disconnect();
      setPrincipal(null);
      setPlugConnected(false);
      setAgent(null);
      setCanisters({});
    }
  }

  // Check if Plug is already connected on mount
  useEffect(() => {
    const checkPlugConnection = async () => {
      if (window.ic && window.ic.plug) {
        const connected = await window.ic.plug.isConnected();
        if (connected) {
          const principal = await window.ic.plug.getPrincipal();
          setPrincipal(principal.toString());
          setPlugConnected(true);
          
          const agent = await window.ic.plug.createAgent({
            host: "http://127.0.0.1:4943"
          });
          setAgent(agent);
          initializeCanisters(agent);
        }
      }
    };
    
    checkPlugConnection();
  }, []);

  // Internet Identity login
  const loginII = async () => {
    const client = await AuthClient.create();
    setAuthClient(client);
    await client.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: async () => {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal().toText();
        setIiPrincipal(principal);
        setIiLoggedIn(true);
      },
    });
  };

  // Internet Identity logout
  const logoutII = async () => {
    if (authClient) {
      await authClient.logout();
    }
    setIiPrincipal(null);
    setIiLoggedIn(false);
  };

  // On mount, check if II is already logged in
  useEffect(() => {
    AuthClient.create().then((client) => {
      setAuthClient(client);
      if (client.isAuthenticated()) {
        const identity = client.getIdentity();
        setIiPrincipal(identity.getPrincipal().toText());
        setIiLoggedIn(true);
      }
    });
  }, []);

  // Preferred principal: II if logged in, else Plug
  const preferredPrincipal = iiLoggedIn ? iiPrincipal : principal;

  return (
    <WalletContext.Provider value={{
      principal,
      plugConnected,
      connectPlug,
      disconnectPlug,
      agent,
      canisters,
      CANISTER_IDS,
      // II integration
      iiPrincipal,
      iiLoggedIn,
      loginII,
      logoutII,
      preferredPrincipal,
    }}>
      {children}
    </WalletContext.Provider>
  );
} 