export function validateClientLink(clientEmail: string, accountEmail: string, roles: readonly string[], confirmed: boolean) {
  if (clientEmail.trim().toLowerCase() !== accountEmail.trim().toLowerCase()) throw new Error("The sign-in email must match the client record email.");
  if (!confirmed) throw new Error("The client must confirm their email before linking.");
  if (roles.some((role) => role !== "client")) throw new Error("Staff and administrator accounts cannot be linked as separate client logins.");
}