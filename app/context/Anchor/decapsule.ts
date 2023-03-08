export type TimeCapsule = {
  "version": "0.1.0",
  "name": "decapsule",
  "instructions": [
    {
      "name": "buryTimeCapsule",
      "accounts": [
        {
          "name": "buriedTimeCapsule",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "capsule"
              }
            ]
          }
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nfts",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "capsule",
          "type": "publicKey"
        },
        {
          "name": "buryTime",
          "type": "string"
        },
        {
          "name": "sealDuration",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        }
      ]
    },
    {
      "name": "buryNft",
      "accounts": [
        {
          "name": "buriedNft",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "nft"
              }
            ]
          }
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nft",
          "type": "publicKey"
        },
        {
          "name": "buryTime",
          "type": "string"
        },
        {
          "name": "sealDuration",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        }
      ]
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "buriedTimeCapsule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "timeCapsule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nfts",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "capsule",
            "type": "publicKey"
          },
          {
            "name": "buryTime",
            "type": "string"
          },
          {
            "name": "sealDuration",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "nftState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nft",
            "type": "publicKey"
          },
          {
            "name": "buryTime",
            "type": "string"
          },
          {
            "name": "sealDuration",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          }
        ]
      }
    }
  ],
}

export const IDL: TimeCapsule = {
  "version": "0.1.0",
  "name": "decapsule",
  "instructions": [
    {
      "name": "buryTimeCapsule",
      "accounts": [
        {
          "name": "buriedTimeCapsule",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "capsule"
              }
            ]
          }
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nfts",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "capsule",
          "type": "publicKey"
        },
        {
          "name": "buryTime",
          "type": "string"
        },
        {
          "name": "sealDuration",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        }
      ]
    },
    {
      "name": "buryNft",
      "accounts": [
        {
          "name": "buriedNft",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "nft"
              }
            ]
          }
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nft",
          "type": "publicKey"
        },
        {
          "name": "buryTime",
          "type": "string"
        },
        {
          "name": "sealDuration",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        }
      ]
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "buriedTimeCapsule",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initializer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "timeCapsule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nfts",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "capsule",
            "type": "publicKey"
          },
          {
            "name": "buryTime",
            "type": "string"
          },
          {
            "name": "sealDuration",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "nftState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nft",
            "type": "publicKey"
          },
          {
            "name": "buryTime",
            "type": "string"
          },
          {
            "name": "sealDuration",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          }
        ]
      }
    }
  ]
}
