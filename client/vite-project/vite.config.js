export default {
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001', // Must match your server's port
        ws: true,
        changeOrigin: true,
      },
    },
  },
};