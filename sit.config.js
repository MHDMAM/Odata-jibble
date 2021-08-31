module.exports = {
  apps: [{
      name: "",
      script: "app.js",
      // interpreter: "/usr/local/lib/nodejs/node-v14.15.1/bin/node",
      // exec_mode: "fork",
      // exec_mode: "cluster",
      // instances: "2",
      // max_memory_restart: '1G',
      env_sit: {
        port: 9900,
        NODE_ENV: "",
        // NODE_TLS_REJECT_UNAUTHORIZED: "0",
        SSL: false
      }
    }

  ]
};
