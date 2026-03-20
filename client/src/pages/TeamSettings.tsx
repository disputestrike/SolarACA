import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ADMIN_TIER_LABELS, ADMIN_TIERS, type AdminTier } from "@shared/permissions";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function TeamSettings() {
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<AdminTier>("recruiter");

  const utils = trpc.useUtils();
  const invitesQuery = trpc.staff.listPendingInvites.useQuery(undefined, {
    enabled: Boolean(user?.effectivePermissions?.["admins.manage"]),
  });
  const adminsQuery = trpc.staff.listAdmins.useQuery(undefined, {
    enabled: Boolean(user?.effectivePermissions?.["admins.manage"]),
  });

  const inviteMutation = trpc.staff.inviteByEmail.useMutation({
    onSuccess: (data) => {
      utils.staff.listPendingInvites.invalidate();
      setEmail("");
      if (data.emailSent) {
        toast.success("Invite saved — we sent them an email with the sign-in link.");
      } else if (data.emailNote) {
        toast.warning(data.emailNote, { duration: 12_000 });
      } else {
        toast.success("Invite saved.");
      }
    },
  });

  const cancelMutation = trpc.staff.cancelInvite.useMutation({
    onSuccess: () => utils.staff.listPendingInvites.invalidate(),
  });

  const revokeMutation = trpc.staff.revokeMember.useMutation({
    onSuccess: () => utils.staff.listAdmins.invalidate(),
  });

  const updateMutation = trpc.staff.updateMember.useMutation({
    onSuccess: () => utils.staff.listAdmins.invalidate(),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <p className="text-muted-foreground mb-4">Sign in to manage team access.</p>
          <Button asChild>
            <a href="/api/oauth/login">Sign in with Google</a>
          </Button>
        </Card>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <p className="font-medium">Recruiter access required.</p>
          <p className="text-sm text-muted-foreground mt-2">This page is only for admin accounts.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!user.effectivePermissions["admins.manage"]) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">You can’t manage team members</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your role doesn’t include “Invite admins &amp; edit roles”. Ask a super admin to update your access.
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/dashboard">Back to pipeline</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Pipeline
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="h-7 w-7 text-primary" />
                Team &amp; permissions
              </h1>
              <p className="text-sm text-muted-foreground">
                Invite teammates by Google email. They sign in with Google and land on the dashboard automatically.
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                /dashboard/settings — master admin only (needs “manage admins” permission)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Invite admin</h2>
          <p className="text-sm text-muted-foreground">
            We email them a sign-in link if <strong>RESEND_API_KEY</strong> or <strong>SENDGRID_API_KEY</strong> is set
            on the server (Railway variables). They must use the <strong>same Google email</strong> you invited. If
            email isn’t configured, the invite is still saved — copy the login URL from the warning toast.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={tier} onValueChange={(v) => setTier(v as AdminTier)}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADMIN_TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ADMIN_TIER_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!email || inviteMutation.isPending}
              onClick={() =>
                inviteMutation.mutate({ email: email.trim(), adminTier: tier })
              }
            >
              {inviteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send invite"}
            </Button>
          </div>
          {inviteMutation.isError && (
            <p className="text-sm text-destructive">
              {inviteMutation.error?.message || "Invite failed"}
            </p>
          )}
          {inviteMutation.isSuccess && inviteMutation.data?.emailSent && (
            <p className="text-sm text-emerald-700">Last invite: email sent. They get access on next Google sign-in.</p>
          )}
          {inviteMutation.isSuccess && !inviteMutation.data?.emailSent && inviteMutation.data?.emailNote && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
              {inviteMutation.data.emailNote}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pending invites</h2>
          {invitesQuery.isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : !invitesQuery.data?.length ? (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitesQuery.data.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>{inv.adminTier.replace(/_/g, " ")}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate({ id: inv.id })}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Current admins</h2>
          {adminsQuery.isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminsQuery.data?.map((a) => (
                  <AdminRow
                    key={a.openId}
                    admin={a}
                    currentOpenId={user.openId}
                    onRevoke={(openId) => revokeMutation.mutate({ openId })}
                    onUpdateTier={(openId, adminTier) =>
                      updateMutation.mutate({ openId, adminTier })
                    }
                    revoking={revokeMutation.isPending}
                    updating={updateMutation.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <p className="text-xs text-muted-foreground">
          Primary owner is the account matching <code className="bg-muted px-1 rounded">ADMIN_EMAIL</code> in
          production. That account can’t be revoked here.
        </p>
      </div>
    </div>
  );
}

function AdminRow({
  admin,
  currentOpenId,
  onRevoke,
  onUpdateTier,
  revoking,
  updating,
}: {
  admin: {
    openId: string;
    name: string | null;
    email: string | null;
    adminTier: string | null;
    isEnvOwner?: boolean;
  };
  currentOpenId: string;
  onRevoke: (openId: string) => void;
  onUpdateTier: (openId: string, tier: AdminTier) => void;
  revoking: boolean;
  updating: boolean;
}) {
  const [localTier, setLocalTier] = useState<AdminTier>(
    (admin.adminTier as AdminTier) || "recruiter"
  );

  useEffect(() => {
    setLocalTier((admin.adminTier as AdminTier) || "recruiter");
  }, [admin.openId, admin.adminTier]);

  return (
    <TableRow>
      <TableCell>{admin.name || "—"}</TableCell>
      <TableCell className="text-sm">{admin.email}</TableCell>
      <TableCell>
        <Select
          value={localTier}
          disabled={admin.isEnvOwner || updating}
          onValueChange={(v) => {
            const t = v as AdminTier;
            setLocalTier(t);
            onUpdateTier(admin.openId, t);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_TIERS.map((t) => (
              <SelectItem key={t} value={t} disabled={admin.isEnvOwner && t !== "super_admin"}>
                {ADMIN_TIER_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        {admin.isEnvOwner ? (
          <span className="text-xs text-muted-foreground">Primary owner</span>
        ) : admin.openId === currentOpenId ? (
          <span className="text-xs text-muted-foreground">You</span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30"
            disabled={revoking}
            onClick={() => onRevoke(admin.openId)}
          >
            Revoke
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
