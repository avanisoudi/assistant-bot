import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  Send, StopCircle, Power, Copy, Check, Terminal,
  ArrowLeft, Smartphone, Wifi, WifiOff, Clock, Zap
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/" });
  const [, navigate] = useLocation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [copied, setCopied] = useState(false);

  const botStatus = trpc.bot.status.useQuery(undefined, {
    refetchInterval: 3000,
    retry: false,
  });

  const deployMutation = trpc.bot.deploy.useMutation({
    onSuccess: () => {
      setIsDeploying(false);
      toast.success("Connexion en cours...");
      botStatus.refetch();
    },
    onError: (err) => {
      setIsDeploying(false);
      toast.error("Erreur: " + err.message);
    },
  });

  const stopMutation = trpc.bot.stop.useMutation({
    onSuccess: () => {
      toast.success("Bot arrêté");
      botStatus.refetch();
    },
    onError: (err) => {
      toast.error("Erreur: " + err.message);
    },
  });

  const clearLogsMutation = trpc.bot.clearLogs.useMutation({
    onSuccess: () => {
      botStatus.refetch();
    },
  });

  const handleDeploy = useCallback(() => {
    if (!phoneNumber.trim()) {
      toast.error("Entrez un numéro WhatsApp");
      return;
    }
    if (!/^[0-9]{8,15}$/.test(phoneNumber.replace(/\s/g, ""))) {
      toast.error("Numéro invalide (ex: 237651543248)");
      return;
    }
    setIsDeploying(true);
    deployMutation.mutate({ phoneNumber: phoneNumber.replace(/\s/g, "") });
  }, [phoneNumber, deployMutation]);

  const handleStop = useCallback(() => {
    stopMutation.mutate();
  }, [stopMutation]);

  // Copy pairing code
  const copyCode = useCallback(() => {
    const code = botStatus.data?.pairingCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [botStatus.data?.pairingCode]);

  // Countdown timer for pairing code
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const expiresAt = botStatus.data?.pairingCodeExpiresAt;
    if (!expiresAt) {
      setTimeLeft(0);
      return;
    }
    const remaining = Math.max(0, new Date(expiresAt).getTime() - Date.now());
    setTimeLeft(remaining);

    const interval = setInterval(() => {
      const remaining = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [botStatus.data?.pairingCodeExpiresAt]);

  // Auto-scroll logs
  const logsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [botStatus.data?.logs]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const statusColor = {
    idle: "bg-muted text-muted-foreground",
    connecting: "bg-yellow-500/20 text-yellow-400",
    connected: "bg-primary/20 text-primary",
    error: "bg-destructive/20 text-destructive",
  }[botStatus.data?.status || "idle"];

  const statusIcon = {
    idle: WifiOff,
    connecting: Clock,
    connected: Wifi,
    error: Zap,
  }[botStatus.data?.status || "idle"] || WifiOff;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">AV</span>
              </div>
              <span className="font-semibold text-sm">AVANCODE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.name || "Utilisateur"}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container max-w-4xl mx-auto py-8 px-4">
        {/* STATUS CARD */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => { const Icon = statusIcon; return <Icon className="h-5 w-5" />; })()}
                <span className="font-semibold">Statut du Bot</span>
              </div>
              <Badge className={statusColor}>
                {botStatus.data?.status === "connected" ? "Connecté" :
                 botStatus.data?.status === "connecting" ? "Connexion..." :
                 botStatus.data?.status === "error" ? "Erreur" : "Déconnecté"}
              </Badge>
            </div>

            {botStatus.data?.status === "connected" && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Bot actif et fonctionnel
              </div>
            )}
          </CardContent>
        </Card>

        {/* DEPLOY SECTION */}
        <Card className="mb-6 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Déployer le Bot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Numéro WhatsApp (ex: 237651543248)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={botStatus.data?.status === "connecting" || botStatus.data?.status === "connected"}
                  className="border-border bg-secondary/50"
                />
              </div>
              {botStatus.data?.status === "connected" || botStatus.data?.status === "connecting" ? (
                <Button
                  variant="destructive"
                  onClick={handleStop}
                  disabled={stopMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <StopCircle className="h-4 w-4" />
                  Arrêter
                </Button>
              ) : (
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying || deployMutation.isPending || !phoneNumber.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  <Power className="h-4 w-4" />
                  {isDeploying ? "Connexion..." : "Déployer"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PAIRING CODE AVANCODE */}
        {botStatus.data?.pairingCode && (
          <Card className="mb-6 border-primary/30 bg-card glow-whatsapp">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Code AVANCODE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                <code className="text-2xl font-mono font-bold tracking-widest text-primary">
                  {botStatus.data.pairingCode}
                </code>
                <Button variant="ghost" size="icon" onClick={copyCode} className="ml-4">
                  {copied ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Temps restant
                </div>
                <span className={`font-mono font-bold ${timeLeft < 60000 ? "text-destructive" : "text-primary"}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              <Progress value={(timeLeft / (3 * 60 * 1000)) * 100} className="h-2" />

              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Pour vous connecter :</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Ouvrez WhatsApp</li>
                  <li>Allez dans <strong>Appareils connectés</strong></li>
                  <li>Cliquez <strong>Connecter avec numéro de téléphone</strong></li>
                  <li>Entrez le code ci-dessus</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LOGS CONSOLE */}
        <Card className="mb-6 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Console de Logs
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => clearLogsMutation.mutate()}>
              Effacer
            </Button>
          </CardHeader>
          <CardContent>
            <div
              ref={logsRef}
              className="h-64 overflow-y-auto rounded-lg bg-secondary/30 border border-border p-4 font-mono text-sm"
            >
              {botStatus.data?.logs && botStatus.data.logs.length > 0 ? (
                <div className="space-y-1.5">
                  {botStatus.data.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground text-xs shrink-0">
                        {new Date(log.time).toLocaleTimeString()}
                      </span>
                      <span className={`shrink-0 ${
                        log.level === "success" ? "text-primary" :
                        log.level === "error" ? "text-destructive" :
                        log.level === "warn" ? "text-yellow-400" : "text-muted-foreground"
                      }`}>
                        [{log.level}]
                      </span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Aucun log pour le moment
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* COMMANDS LIST */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">58 Commandes disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[
                "antilink", "antitoxic", "antibot", "antispam", "antidelete",
                "add", "kick", "promote", "demote", "warn", "admins", "tag",
                "chatstats", "groupanalysts", "mostactive", "msgcount", "wordcloud",
                "fb", "ig", "tiktok", "yt", "play",
                "dare", "truth", "flip", "kiss", "hug", "slap", "joke", "quote",
                "prefix", "setname", "setdesc", "setpp", "autoread", "autotype", "set",
                "welcome", "goodbye", "ephemeral", "ginfo", "linkgroup", "menu", "list", "revoke",
                "stlak", "rsticker", "ping", "del", "lock", "unlock",
                "anonhidemsg", "fakecall", "nsfw", "nudes", "random", "vv"
              ].map((cmd, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground py-1.5 px-2 rounded bg-secondary/30">
                  <Zap className="h-3 w-3 text-primary shrink-0" />
                  {cmd}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
