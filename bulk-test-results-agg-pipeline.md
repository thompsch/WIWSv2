This agg pipeline finds all recipients who have **not** responded to the latest 
bulk test:

[
  {
    $match:
      {
        name: {
          $ne: "TestThompson",
        },
      },
  },
  {
    $facet: {
      BulkTests: [
        {
          $lookup: {
            from: "BulkTests",
            let: {},
            pipeline: [],
            as: "BulkTests",
          },
        },
        {
          $project: {
            _id: 0,
            maxValue: {
              $max: "$BulkTests.testId",
            },
          },
        },
      ],
      Testers: [
        {
          $project: {
            lastTest: {
              $arrayElemAt: [
                "$testResponses",
                {
                  $indexOfArray: [
                    "$testResponses",
                    {
                      $max: "$testResponses",
                    },
                  ],
                },
              ],
            },
            name: 1,
          },
        },
      ],
    },
  },
  {
    $unwind: "$Testers",
  },
  {
    $match: {
      $expr: {
        $ne: [
          "$Testers.lastTest",
          {
            $arrayElemAt: [
              "$BulkTests.maxValue",
              0,
            ],
          },
        ],
      },
    },
  },
  {
    $replaceWith: "$Testers",
  },
]
