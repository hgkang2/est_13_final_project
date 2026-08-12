const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nonwqefcwvcppaoemdqk.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        protocol: "https",
        hostname: "nonwqefcwvcppaoemdqk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
