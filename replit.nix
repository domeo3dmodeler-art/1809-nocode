{ pkgs }: {
  deps = [
    pkgs.nodejs_20      # node + npm внутри
    pkgs.curl
    pkgs.jq
    pkgs.bashInteractive
  ];
}
