# R market analysis

Run from project root with an installed R runtime:

```text
Rscript analysis/market-analysis.R
```

Uses only base R. No credentials, extra R packages, financial prices, or synthetic observations are needed.

The raw monthly job-openings series is checked for missing values, duplicate dates and continuity. Lag 1–12 features use preceding observed months. After the 12-month warmup, samples are split chronologically into 60% train, 20% validation, and the remaining test observations. The validation MAE selects among AR(1), AR(3), AR(12) and last-month persistence. The selected scheme is refitted on train + validation and evaluated once on the untouched test targets.

Test predictions are one step ahead: each target uses actual lagged observations from earlier months. This is not a recursive forecast from the start of the test period. Parameters are not refitted during the test period. Monthly release delay and historical data revisions are not reconstructed, so no real-time information-set claim is made.

Outputs: dataset-splits.csv, validation-metrics.csv, test-metrics.csv, test-predictions.csv, market-results.js, run-log.txt. The HTML reads the generated JS snapshot without requiring an R server. To update data, explicitly download a new snapshot, record its date and hash, rerun R and inspect the results. Do not silently change the test set and keep old metrics.

Success means a reproducible experiment with honest comparison, not necessarily outperforming the baseline. Negative performance improvement must remain visible.
