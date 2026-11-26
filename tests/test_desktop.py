import socket

from companion import desktop


def test_resolve_runtime_paths_uses_explicit_data_dir_and_copies_env_example(tmp_path):
    target = tmp_path / "portable-data"
    paths = desktop.resolve_runtime_paths({"COMPANION_DATA_DIR": str(target)})
    assert paths.data_dir == target.resolve()
    assert paths.data_dir.exists()
    assert (paths.data_dir / ".env.example").exists()
    assert paths.log_file == target.resolve() / "echo-companion.log"


def test_pick_port_skips_occupied_non_companion_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as occupied:
        occupied.bind(("127.0.0.1", 0))
        occupied.listen(1)
        busy_port = occupied.getsockname()[1]

        chosen, already_running = desktop.pick_port("127.0.0.1", busy_port)
        assert already_running is False
        assert chosen != busy_port
        assert chosen > 0


def test_parse_args_supports_headless_port_and_version():
    args = desktop.parse_args(["--headless", "--no-tray", "--port", "9123"])
    assert args.headless is True
    assert args.no_tray is True
    assert args.port == 9123
    assert args.version is False
    assert desktop.main(["--version"]) == 0
