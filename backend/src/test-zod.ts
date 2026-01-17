import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
});

const user = UserSchema.parse({ name: "João", email: "joao@email.com" });
console.log(user); // { name: "João", email: "joao@email.com" }
