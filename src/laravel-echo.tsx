import Echo from "laravel-echo";
import Io from "socket.io-client";
if (
  typeof window !== "undefined" &&
  process.env.REACT_APP_SOCKET_IO_URL &&
  process.env.REACT_APP_SOCKET_IO_PORT
) {
  (window as any).io = Io;
  (window as any).Echo = new Echo({
    broadcaster: "socket.io",
    host: `${process.env.REACT_APP_SOCKET_IO_URL}:${process.env.REACT_APP_SOCKET_IO_PORT}`,
    client: Io,
  });
}
