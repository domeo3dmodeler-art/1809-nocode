{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.openssl
    pkgs.postgresql
    pkgs.curl
    pkgs.git
  ];
}
