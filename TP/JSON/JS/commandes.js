var cdes = [
{
    "user": 
    	{
            "id": 54847,
            "nom": "DUPONT Jean",
            "sexe": "M",
            "cp": 13000
        },
    "games": [
        {
            "id": 76,
            "titre": "NBA 2K24 Edition Légende Black Mamba",
            "prix": 74.99
        },
        {
            "id": 2,
            "titre": "Super Mario Bros. Wonder Nintendo Switch",
            "prix": 49.99
        }
    ],
    "tva": 25.00,
    "totalht": 124.98,
    "date": ISODate("2024-10-20T00:00:00Z")
},
{
    "user": 
    	{
            "id": 54846,
            "nom": "DUPONT Marie",
            "sexe": "F",
            "cp": 13000
        },
    "date": ISODate("2024-10-21T00:00:00Z"),
    "games": [
        {
            "id": 76,
            "titre": "NBA 2K24 Edition Légende Black Mamba",
            "prix": 74.99
        },
        {
            "id": 3,
            "titre": "Marvel's Spider-Man 2",
            "prix": 69.99
        }
    ],
    "tva": 29.00,
    "totalht": 144.98
},
{
    "user": 
    	{
            "id": 54845,
            "nom": "COLIN Pascal",
            "sexe": "m",
            "cp": 74000
        },
    "date": ISODate("2024-09-20T00:00:00Z"),
    "games": [
        {
            "id": 3,
            "titre": "Marvel's Spider-Man 2",
            "prix": 69.99
        }
    ],
    "tva": 14.00,
    "totalht": 69.99
},
{
    "user": 
    	{
            "id": 54843,
            "nom": "COUDRE Vince",
            "sexe": "m",
            "cp": 74000
        },
    "date": ISODate("2024-10-10T00:00:00Z"),
    "games": [
        {
            "id": 1,
            "titre": "EA Sports FC 24",
            "prix": 39.00
        }
    ],
    "tva": 7.80,
    "totalht": 39.00
},
{
    "user": 
    	{
            "id": 54842,
            "nom": "COUDRE Pauline",
            "sexe": "f",
            "cp": 74000
        },
    "date": ISODate("2024-10-22T00:00:00Z"),
    "games": [
        {
            "id": 10,
            "titre": "Dragon Ball: Sparking! Zero",
            "prix": 66.99
        },
        {
            "id": 11,
            "titre": "Call of Duty : Black Ops 6",
            "prix": 69.99
        }
    ],
    "tva": 27.40,
    "totalht": 136.98
},
{
    "user": 
    	{
            "id": 54842,
            "nom": "COUDRE Elodie",
            "sexe": "F",
            "cp": 74000
        },
    "date": ISODate("2024-10-22T00:00:00Z"),
    "games": [
        {
            "id": 1,
            "titre": "EA Sports FC 24",
            "prix": 39.00
        },
        {
            "id": 11,
            "titre": "Call of Duty : Black Ops 6",
            "prix": 69.99
        },
        {
            "id": 3,
            "titre": "Marvel's Spider-Man 2",
            "prix": 69.99
        }
        
    ],
    "tva": 35.80,
    "totalht": 178.98
},
{
    "user": 
    	{
            "id": 54841,
            "nom": "HENRY Fanny",
            "sexe": "f",
            "cp": 69001
        },
    "date": ISODate("2024-09-01T00:00:00Z"),
    "tva": 40.00,
    "totalht": 200.00
},
{
    "user": 
    	{
            "id": 54840,
            "nom": "HENRY Mathieu",
            "sexe": "M",
            "cp": 69001
        },
    "date": ISODate("2024-09-01T00:00:00Z"),
    "tva": 20.00,
    "totalht": 100.00
}
]
db.commandes.insertMany(cdes)
