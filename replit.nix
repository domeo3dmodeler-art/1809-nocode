{ pkgs }:
{
  # совместимый набор пакетов; добавили curl и bashInteractive
  deps = [
    pkgs.nodejs_20
    pkgs.jq
    pkgs.curl
    pkgs.bashInteractive
  ];
}
