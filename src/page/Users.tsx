import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Search,
  MoreVertical,
  ShieldCheck,
  UserX,
  UserCheck,
  BrushCleaning,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import CreateUserModal from "@/components/CreateUserModal";
import Avatar from "@/components/Avatar";
import { TableSkeleton } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { EmptyState } from "@/components/states/EmptyState";
import { useNavigate } from "react-router-dom";

interface UserRow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  email: string;
  total_observations: number;
  validated_observations: number;
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    USER: "bg-stone-100 text-stone-600",
    TECHNICIAN: "bg-blue-100 text-blue-700",
    ADMIN: "bg-purple-100 text-purple-700",
  };
  const labels: Record<string, string> = {
    USER: "Utilizador",
    TECHNICIAN: "Técnico",
    ADMIN: "Admin",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role]}`}
    >
      {labels[role]}
    </span>
  );
}

export default function Users() {
  const { profile, user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Dialogs
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [toggleUser, setToggleUser] = useState<UserRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Verificar se é admin
  const isAdmin = profile?.role === "ADMIN";

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_users_with_stats");
      if (error) throw error;

      let filtered = data || [];

      if (roleFilter !== "ALL") {
        filtered = filtered.filter((u: UserRow) => u.role === roleFilter);
      }

      if (search.trim() !== "") {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (u: UserRow) =>
            u.username?.toLowerCase().includes(term) ||
            u.full_name?.toLowerCase().includes(term) ||
            u.email?.toLowerCase().includes(term),
        );
      }

      setUsers(filtered);
      setCurrentPage(1);
    } catch (error) {
      console.log("Erro ao buscar utilizadores:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchUsers();
  }, [user, authLoading, search, roleFilter]);

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("update_user_role", {
        p_user_id: editingUser.id,
        p_new_role: newRole,
      });

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, role: newRole } : u,
        ),
      );

      toast.success("Role atualizada com sucesso!");
      setEditingUser(null);
      setNewRole("");
    } catch (error) {
      console.log("Erro:", error);
      toast.error("Erro ao atualizar role.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleUser) return;

    setSubmitting(true);
    try {
      const newActive = !toggleUser.is_active;
      const { error } = await supabase.rpc("toggle_user_active", {
        p_user_id: toggleUser.id,
        p_is_active: newActive,
      });

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === toggleUser.id ? { ...u, is_active: newActive } : u,
        ),
      );

      toast.success(
        newActive
          ? "Conta ativada com sucesso!"
          : "Conta desativada com sucesso!",
      );
      setToggleUser(null);
    } catch (error) {
      console.log("Erro:", error);
      toast.error("Erro ao alterar estado da conta.");
    } finally {
      setSubmitting(false);
    }
  };

  // Paginação
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <ShieldCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500">
          Apenas administradores podem aceder a esta página.
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between">
        <h2 className="font-medium text-xl">Utilizadores</h2>
        <CreateUserModal onCreated={fetchUsers} />
      </header>

      {/* Filtros */}
      <section className="mt-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              className="pl-9 w-full bg-white"
              placeholder="Pesquisar por nome, username ou email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Todas as roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Todas as roles</SelectItem>
                  <SelectItem value="USER">Utilizadores</SelectItem>
                  <SelectItem value="TECHNICIAN">Técnicos</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Tabela */}
      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : error ? (
        <ErrorState onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={BrushCleaning}
          title="Sem utilizadores"
          description="Nenhum utilizador corresponde aos filtros selecionados."
        />
      ) : (
        <div className="mt-5">
          <Table className="bg-white">
            <TableHeader className="bg-stone-100">
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                <>
                  {paginatedUsers.map((u) => (
                    <TableRow key={u.id} className="h-[60px]">
                      <TableCell>
                        <Avatar
                          name={u.full_name}
                          username={u.username}
                          avatarUrl={u.avatar_url}
                          size={36}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {u.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-stone-500">
                        @{u.username}
                      </TableCell>
                      <TableCell className="text-stone-500">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={u.role} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {u.validated_observations}/{u.total_observations}
                        </span>
                      </TableCell>
                      <TableCell>
                        {u.is_active ? (
                          <span className="text-xs text-green-700 font-medium">
                            Ativo
                          </span>
                        ) : (
                          <span className="text-xs text-red-500 font-medium">
                            Inativo
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setNewRole(u.role);
                            }}
                            disabled={u.id === user?.id}
                            className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              u.id === user?.id
                                ? "Não podes alterar a tua própria role"
                                : "Alterar role"
                            }
                          >
                            Alterar role
                          </button>
                          <button
                            onClick={() => setToggleUser(u)}
                            disabled={u.id === user?.id}
                            className={`p-1.5 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.is_active
                                ? "text-red-500 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              u.is_active ? "Desativar conta" : "Ativar conta"
                            }
                          >
                            {u.is_active ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>
                          <button
                            className="hover:cursor-pointer"
                            onClick={() => navigate(`/users/${u.id}`)}
                          >
                            <Eye strokeWidth={1.2} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {Array.from({
                    length: itemsPerPage - paginatedUsers.length,
                  }).map((_, i) => (
                    <TableRow
                      key={`empty-${i}`}
                      className="h-[60px] hover:bg-transparent border-none"
                    >
                      <TableCell colSpan={8} className="py-0"></TableCell>
                    </TableRow>
                  ))}
                </>
              ) : (
                <>
                  {Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TableRow
                      key={`empty-${i}`}
                      className="h-[60px] hover:bg-transparent border-none"
                    >
                      <TableCell
                        colSpan={8}
                        className={`py-0 ${i === 0 ? "text-center text-stone-400" : ""}`}
                      >
                        {i === 0 ? "Nenhum utilizador encontrado." : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-stone-200">
              <p className="text-sm text-stone-500">
                A mostrar {(currentPage - 1) * itemsPerPage + 1} a{" "}
                {Math.min(currentPage * itemsPerPage, users.length)} de{" "}
                {users.length}
              </p>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Dialog: Alterar Role */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar role do utilizador</DialogTitle>
            <DialogDescription>
              {editingUser?.full_name} (@{editingUser?.username})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs text-stone-500 uppercase">
              Nova role
            </label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="mt-1 w-full bg-white">
                <SelectValue placeholder="Selecionar role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="USER">Utilizador</SelectItem>
                  <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdateRole}
              disabled={submitting || newRole === editingUser?.role}
              className={`px-4 py-2 rounded-lg text-sm ${
                submitting || newRole === editingUser?.role
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-[#2D5A3D] text-white cursor-pointer hover:bg-[#1f4a2d]"
              }`}
            >
              {submitting ? "A guardar..." : "Confirmar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ativar/Desativar */}
      <Dialog open={!!toggleUser} onOpenChange={() => setToggleUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {toggleUser?.is_active ? "Desativar" : "Ativar"} conta
            </DialogTitle>
            <DialogDescription>
              {toggleUser?.is_active
                ? `Tens a certeza que queres desativar a conta de ${toggleUser?.full_name}? O utilizador deixa de poder usar a aplicação.`
                : `Tens a certeza que queres reativar a conta de ${toggleUser?.full_name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setToggleUser(null)}
              className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleToggleActive}
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-sm ${
                submitting
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : toggleUser?.is_active
                    ? "bg-red-600 text-white cursor-pointer hover:bg-red-700"
                    : "bg-[#2D5A3D] text-white cursor-pointer hover:bg-[#1f4a2d]"
              }`}
            >
              {submitting
                ? "A processar..."
                : toggleUser?.is_active
                  ? "Desativar"
                  : "Ativar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
