
from app import create_app, db
from app.models.storage_node import StorageNode

app = create_app()

sample_nodes = [
    {
        "node_name": "SAN-NODE-01",
        "ip_address": "192.168.1.101",
        "total_capacity_gb": 500
    },
    {
        "node_name": "SAN-NODE-02",
        "ip_address": "192.168.1.102",
        "total_capacity_gb": 500
    },
    {
        "node_name": "SAN-NODE-03",
        "ip_address": "192.168.1.103",
        "total_capacity_gb": 1000
    },
    {
        "node_name": "SAN-NODE-04",
        "ip_address": "192.168.1.104",
        "total_capacity_gb": 1000
    }
]

with app.app_context():
    for item in sample_nodes:
        existing = StorageNode.query.filter_by(
            node_name=item["node_name"]
        ).first()

        if not existing:
            node = StorageNode(**item)
            db.session.add(node)

    db.session.commit()

    print("SAN storage nodes initialized successfully!")

    for node in StorageNode.query.all():
        print(node.node_name, node.total_capacity_gb, "GB")
