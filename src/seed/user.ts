import { IUser } from "../interfaces/user.interface";

const users: IUser[] = [
  {
    name: "marcos",
    email: "marcosverblud@gmail.com",
    password: "!23$5",
    phone: 3515645850,
    token: "",
    activated: true,
    role: "ADMIN_ROLE",
  },
  {
    name: "test",
    email: "test@gmail.com",
    password: "!23$5",
    token: "",
    activated: true,
    role: "USER_ROLE",
  },
];

export default users;
