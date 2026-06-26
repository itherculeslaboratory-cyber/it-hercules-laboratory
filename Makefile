# IHL Docker dev shortcuts (Unix / Git Bash / WSL)
# Windows PowerShell: scripts/docker-dev.ps1

.PHONY: docker-build docker-up docker-down docker-test docker-logs docker-shell pipeline

# Serial Phase 1 pipeline (Unix). Windows: scripts/run-pipeline.ps1
# Usage: make pipeline INPUT_MANIFEST=fixtures/input.json SOURCE_IMAGE=fixtures/img.jpg OUTPUT_BASE=/tmp/ihl-out RUN_ID=run_local_01
pipeline:
	@test -n "$(INPUT_MANIFEST)" || (echo "INPUT_MANIFEST required" && exit 1)
	@test -n "$(SOURCE_IMAGE)" || (echo "SOURCE_IMAGE required" && exit 1)
	@test -n "$(OUTPUT_BASE)" || (echo "OUTPUT_BASE required" && exit 1)
	@test -n "$(RUN_ID)" || (echo "RUN_ID required" && exit 1)
	python -m components.ingest_normalize.run --input-manifest "$(INPUT_MANIFEST)" --output-dir "$(OUTPUT_BASE)/ingest" --run-id "$(RUN_ID)"
	python -m components.thumbnail_builder.run --input-manifest "$(INPUT_MANIFEST)" --output-dir "$(OUTPUT_BASE)/thumbnail" --run-id "$(RUN_ID)" --source-image "$(SOURCE_IMAGE)"
	python -m components.embedding_builder.run --input-manifest "$(INPUT_MANIFEST)" --image-path "$(SOURCE_IMAGE)" --output-dir "$(OUTPUT_BASE)/embedding" --run-id "$(RUN_ID)"
	@echo '{"normalized_parquet":"$(OUTPUT_BASE)/ingest/captures_$(RUN_ID).parquet","thumbnail_manifest":"$(OUTPUT_BASE)/thumbnail/thumbnail_manifest.json","embedding_manifest":"$(OUTPUT_BASE)/embedding/embedding_manifest.json"}' > "$(OUTPUT_BASE)/build_manifest.json"
	python -m components.manifest_builder.run --build-manifest "$(OUTPUT_BASE)/build_manifest.json" --output-dir "$(OUTPUT_BASE)/manifest" --run-id "$(RUN_ID)"

.PHONY: docker-build docker-up docker-down docker-test docker-logs docker-shell

docker-build:
	docker compose build

docker-up:
	docker compose up search

docker-down:
	docker compose down

docker-test:
	docker compose --profile test run --rm test

docker-logs:
	docker compose logs -f search

docker-shell:
	docker compose run --rm search bash
