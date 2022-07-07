//
// Table of parallel Gospel texts.
// Based upon the table contained within:
// White, Gregory A. The NET Bible: Synopsis of the Four Gospels. Richardson: Biblical Studies Press, 2005.
// https://bible.org/assets/pdf/White_ntsynopsis.pdf
//
// This table only contains parallels, listings by White/Aland/... which reer to only one Gospel text
// have been excluded.
//

interface ParallelText {
    title: string;
    mt?: string;
    mk?: string;
    lk?: string;
    jn?: string;
}

export const parallels: ParallelText[] = [
    {
        title: "Prologue",
        mt: "1:1",
        mk: "1:1",
        lk: "1:1-4",
        jn: "1:1-18",
    },
    {
        title: "The Birth of Jesus",
        mt: "1:18-25",
        lk: "2:1-7",
    },
    {
        title: "The Adoration of the Infant Jesus",
        mt: "2:1-12",
        lk: "2:8-20",
    },
    {
        title: "The Childhood of Jesus at Nazareth",
        mt: "2:22-23",
        lk: "2:39-40",
    },
    {
        title: "John the Baptist",
        mt: "3:1-6",
        mk: "1:2-6",
        lk: "3:1-6",
        jn: "1:19-23",
    },
    {
        title: "John's Preaching of Repentence",
        mt: "3:7-10",
        lk: "3:7-9",
    },
    {
        title: "John's Messianic Preaching",
        mt: "3:11-12",
        mk: "1:7-8",
        lk: "3:15-18",
        jn: "1:24-28",
    },
    {
        title: "The Baptism of Jesus",
        mt: "3:13-17",
        mk: "1:9-11",
        lk: "3:21-22",
        jn: "1:29-34",
    },
    {
        title: "The Temptation",
        mt: "4:1-11",
        mk: "1:12-13",
        lk: "4:1-13",
    },
    {
        title: "The Journey into Galilee",
        mt: "4:12",
        mk: "1:14", // FIXME: 1:14a
        lk: "4:14", // FIXME: 14:14a
        jn: "4:1-3",
    },
    {
        title: "Ministry in Galilee",
        mt: "4:13-17",
        mk: "1:14-15", // FIXME: 1:14b
        lk: "4:14-15", // FIXME: 14:14a
        jn: "4:43-46", // FIXME: 46a
    },
    {
        title: "The Call of the Disciples",
        mt: "4:18-22",
        mk: "1:16-20",
    },
    {
        title: "Teaching in the Synagogue at Capernaum",
        mk: "1:21-22",
        lk: "4:31-32",
    },
    {
        title: "The Healing of the Demoniac in the Synagogue",
        mk: "1:23-28",
        lk: "4:33-37",
    },
    {
        title: "The Healing of Peter's Mother-in-law",
        mk: "1:29-31",
        lk: "4:38-39",
    },
    {
        title: "The Sick Healed at Evening",
        mk: "1:32-34",
        lk: "4:40-41",
    },
    {
        title: "Jesus Departs from Capernaurn",
        mk: "1:35-38",
        lk: "4:42-43",
    },
    {
        title: "First Preaching Tour in Galilee",
        mt: "4:23",
        mk: "1:39",
        lk: "4:44",
    },
    {
        title: "The Cleansing of the Leper",
        mk: "1:40-45",
        lk: "5:12-16",
    },
    {
        title: "The Healing of the Paralytic",
        mk: "2:1-12",
        lk: "5:17-26",
    },
    {
        title: "The Call of Levi (Matthew)",
        mk: "2:13-17",
        lk: "5:27-32",
    },
    {
        title: "The Question about Fasting",
        mk: "2:18-22",
        lk: "5:33-39",
    },
    {
        title: "Plucking Grain on the Sabbath",
        mk: "2:23-28",
        lk: "6:1-5",
    },
    {
        title: "The Man with the Withered Hand",
        mk: "3:1-6",
        lk: "6:6-11",
    },
    {
        title: "The Choosing of the Twelve",
        mk: "3:13-19", // FIXME: 19a
        lk: "6:12-16",
    },
    {
        title: "The Centurion of Capernaum",
        mt: "8:5-13",
        lk: "7:1-10",
        jn: "4:46-54", // FIXME: 4:46b
    },
    {
        title: "John the Baptist's Question and Jesus' Answer",
        mt: "11:2-6",
        lk: "7:18-23",
    },
    {
        title: "Jesus' Witness concerning John",
        mt: "11:7-19",
        lk: "7:24-35",
    },
    {
        title: "On Collusion with Satan",
        mt: "12:22-30",
        mk: "3:22-27",
    },
    {
        title: "The Sin against the Holy Spirit",
        mt: "12:31-37",
        mk: "3:28-30",
    },
    {
        title: "Jesus' True Kindred",
        mt: "12:46-50",
        mk: "3:31-35",
    },
    {
        title: "The Parable of the Sower",
        mt: "13:1-9",
        mk: "4:1-9",
        lk: "8:4-8",
    },
    {
        title: "The Reason for Speaking in Parables",
        mt: "13:10-17",
        mk: "4:10-12",
        lk: "8:9-10",
    },
    {
        title: "Interpretation of the Parable of the Sower",
        mt: "13:18-23",
        mk: "4:13-20",
        lk: "8:11-15",
    },
    {
        title: "'He who has Ears to Hear, Let him Hear'",
        mk: "4:21-25",
        lk: "8:16-18",
    },
    {
        title: "The Parable of the Mustard Seed",
        mt: "13:31-32",
        mk: "4:30-32",
    },
    {
        title: "Jesus' Use of Parables",
        mt: "13:34-35",
        mk: "4:33-34",
    },
    {
        title: "Stilling the Storm",
        mk: "4:35-41",
        lk: "8:22-25",
    },
    {
        title: "The Gerasene Demoniac",
        mk: "5:1-20",
        lk: "8:26-39",
    },
    {
        title: "Jairus' Daughter and the Woman with a Hemorrhage",
        mk: "5:21-43",
        lk: "8:40-56",
    },
    {
        title: "Jesus is Rejected at Nazareth",
        mt: "13:53-48",
        mk: "6:1-6", // FIXME: 6a
    },
    {
        title: "Commissioning the Twelve",
        mk: "6:6-13", // FIXME: 6b
        lk: "9:1-6",
    },
    {
        title: "Opinions regarding Jesus",
        mt: "14:1-2",
        mk: "6:14-16",
        lk: "9:7-9",
    },
    {
        title: "The Death of John the Baptist",
        mt: "14:3-12",
        mk: "6:17-29",
    },
    {
        title: "The Return of the Apostles",
        mk: "6:30-31",
        lk: "9:10", // FIXME: 9:10a
    },
    {
        title: "Five Thousand are Fed",
        mt: "14:13-21",
        mk: "6:32-44",
        lk: "9:10-17", // FIXME: 9:10b
        jn: "6:1-15",
    },
    {
        title: "The Walking on the Water",
        mt: "14:22-23",
        mk: "6:45-52",
        jn: "6:16-21",
    },
    {
        title: "Healings at Gennesaret",
        mt: "14:34-36",
        mk: "6:53-56",
        jn: "6:22-25",
    },
    {
        title: "Defilement - Traditional and Real",
        mt: "15:1-20",
        mk: "7:1-23",
    },
    {
        title: "The Syrophoenician (Canaanite) Woman",
        mt: "15:21-28",
        mk: "7:24-30",
    },
    {
        title: "Jesus Heals a Deaf Mute and Many Others",
        mt: "15:29-31",
        mk: "7:31-37",
    },
    {
        title: "Four Thousand are Fed",
        mt: "15:32-39",
        mk: "8:1-10",
    },
    {
        title: "The Pharisees Seek a Sign",
        mt: "16:1-4",
        mk: "8:11-13",
    },
    {
        title: "The Leaven of the Pharisees",
        mt: "16:5-12",
        mk: "8:14-21",
    },
    {
        title: "Peter's Confession",
        mt: "16:13-20",
        mk: "8:27-30",
        lk: "9:18-21",
        jn: "6:67-71",
    },
    {
        title: "Jesus Foretells His Passion",
        mt: "16:21-23",
        mk: "8:31-33",
        lk: "9:22",
    },
    {
        title: "'If Anyone Would Come After Me'",
        mt: "16:24-28",
        mk: "8:34-9:1",
        lk: "9:23-27",
    },
    {
        title: "The Transfiguration",
        mt: "17:1-9",
        mk: "9:2-10",
        lk: "9:28-36",
    },
    {
        title: "The Coming of Elijah",
        mt: "17:10-13",
        mk: "9:11-13",
    },
    {
        title: "Jesus Heals a Boy Possessed by a Spirit",
        mt: "17:14-21",
        mk: "9:14-29",
        lk: "9:37-43", // FIXME 43a
    },
    {
        title: "Jesus Foretells His Passion again",
        mt: "17:22-23",
        mk: "9:30-32",
        lk: "9:43-45", // FIXME 43b
    },
    {
        title: "True Greatness",
        mt: "18:1-5",
        mk: "9:33-37",
        lk: "9:46-48",
    },
    {
        title: "The Strange Exorcist",
        mk: "9:38-41",
        lk: "9:49-50",
    },
    {
        title: "Warnings Concerning Temptations",
        mt: "18:6-9",
        mk: "9:42-50",
    },
    {
        title: "Departure to Judea",
        mt: "19:1-2",
        mk: "10:1",
    },
    {
        title: "On Divorce and Celibacy",
        mt: "19:3-12",
        mk: "10:2-12",
    },
    {
        title: "Jesus Blesses the Children",
        mt: "19:13-15",
        mk: "10:13-16",
        lk: "18:15-17",
    },
    {
        title: "The Rich Young Man",
        mt: "19:16-22",
        mk: "10:17-22",
        lk: "18:18-23",
    },
    {
        title: "On Riches and the Rewards of Discipleship",
        mt: "19:23-30",
        mk: "10:23-31",
        lk: "18:24-30",
    },
    {
        title: "The Third Prediction of the Passion",
        mt: "20:17-19",
        mk: "10:32-34",
        lk: "18:31-34",
    },
    {
        title: "The Sons of Zebedee; Precedence among the Disciples",
        mt: "20:20-28",
        mk: "10:35-45",
    },
    {
        title: "The Healing of the Blind Men (Bartimaeus)",
        mt: "20:29-34",
        mk: "10:46-52",
        lk: "18:35-43",
    },
    {
        title: "The Triumphal Entry",
        mt: "21:1-9",
        mk: "11:1-10",
        lk: "19:28-40",
        jn: "12:12-19",
    },
    {
        title: "Jesus in Jerusalem (Cleansing the Temple), Return to Bethany",
        mt: "21:10-17",
        mk: "11:11",
    },
    {
        title: "The Cursing of the Fig Tree",
        mt: "21:18-19",
        mk: "11:12-14",
        lk: "13:69",
    },
    {
        title: "The Cleansing of the Temple",
        mk: "11:15-17",
        lk: "19:45-46",
    },
    {
        title: "The Chief Priests and Scribes Conspire against Jesus",
        mk: "11:18-19",
        lk: "19:47-48",
    },
    {
        title: "The Fig Tree is Withered",
        mt: "21:20-22",
        mk: "11:20-26",
    },
    {
        title: "The Question about Authority",
        mt: "21:23-27",
        mk: "11:27-33",
        lk: "20:1-8",
    },
    {
        title: "The Parable of the Wicked Husbandmen",
        mt: "21:33-46",
        mk: "12:1-12",
        lk: "20:9-19",
    },
    {
        title: "On Paying Tribute to Caesar",
        mt: "22:15-22",
        mk: "12:13-17",
        lk: "20:20-26",
    },
    {
        title: "The Question about the Resurrection",
        mt: "22:23-33",
        mk: "12:18-27",
        lk: "20:27-40",
    },
    {
        title: "The Great Commandment",
        mt: "22:34-40",
        mk: "12:28-34",
    },
    {
        title: "The Question about David's Son",
        mt: "22:41-46",
        mk: "12:35-37", // FIXME: 37a
        lk: "20:41-44",
    },
    {
        title: "Woe to the Scribes and Pharisees",
        mt: "23:1-36",
        mk: "12:37-40", // FIXME: 37b
        lk: "20:45-47",
    },
    {
        title: "The Widow's Mite",
        mk: "12:41-44",
        lk: "21:1-4",
    },
    {
        title: "The Prediction of the Destruction of the Temple",
        mt: "24:1-2",
        mk: "13:1-2",
        lk: "21:5-6",
    },
    {
        title: "Signs Before the End",
        mt: "24:3-8",
        mk: "13:3-8",
        lk: "21:7-11",
    },
    {
        title: "Persecutions Foretold",
        mt: "24:9-14",
        mk: "13:9-13",
        lk: "21:12-19",
    },
    {
        title: "The Desolating Sacrilege",
        mt: "24:15-22",
        mk: "13:14-20",
        lk: "21:20-24",
    },
    {
        title: "False Christs and False Prophets",
        mt: "24:23-28",
        mk: "13:21-23",
    },
    {
        title: "The Coming of the Son of Man",
        mt: "24:29-31",
        mk: "13:24-27",
        lk: "21:25-28",
    },
    {
        title: "The Time of the Coming: the Parable of the Fig Tree",
        mt: "24:32-36",
        mk: "13:28-32",
        lk: "21:29-33",
    },
    {
        title: "Jesus' Death is Premeditated",
        mt: "26:1-5",
        mk: "14:1-2",
        lk: "22:1-2",
    },
    {
        title: "The Anointing in Bethany",
        mt: "26:6-13",
        mk: "14:3-9",
    },
    {
        title: "The Betrayal by Judas",
        mt: "26:14-16",
        mk: "14:10-11",
        lk: "22:3-6",
    },
    {
        title: "Preparation for the Passover",
        mt: "26:17-20",
        mk: "14:12-17",
        lk: "22:7-14",
    },
    {
        title: "Jesus Foretells His Betrayal",
        mt: "26:21-25",
        mk: "14:18-21",
        jn: "13:21-30",
    },
    {
        title: "The Last Supper",
        mt: "26:26-29",
        mk: "14:22-25",
        lk: "22:15-20",
    },
    {
        title: "Peter's Denial Predicted",
        mt: "26:30-35",
        mk: "14:26-31",
        lk: "22:31-34",
        jn: "13:36-38",
    },
    {
        title: "Gethsemane",
        mt: "26:36-46",
        mk: "14:32-42",
        lk: "22:39-46",
        jn: "18:1",
    },
    {
        title: "Jesus Arrested",
        mt: "26:47-56",
        mk: "14:43-52",
        lk: "22:47-53",
        jn: "18:2-12",
    },
    {
        title: "Jesus before the Sanhedrin (Peter's Denial)",
        mt: "26:57-68",
        mk: "14:53-65",
        lk: "22:54-71",
        jn: "18:13-24",
    },
    {
        title: "Peter's Denial",
        mt: "26:69-75",
        mk: "14:66-72",
        jn: "18:25-27",
    },
    {
        title: "Jesus Delivered to Pilate",
        mt: "27:1-2",
        mk: "15:1",
        lk: "23:1",
        jn: "18:28",
    },
    {
        title: "The Trial Before Pilate",
        mt: "27:11-14",
        mk: "15:2-5",
        lk: "23:2-5",
        jn: "18:29-38",
    },
    {
        title: "Jesus or Barabbas?",
        mt: "27:15-23",
        mk: "15:6-14",
        lk: "23:17-23",
        jn: "18:39-40",
    },
    {
        title: "Pilate Delivers Jesus to be Crucified",
        mt: "27:24-26",
        mk: "15:15",
        lk: "23:24-25",
        jn: "19:16",
    },
    {
        title: "Jesus Mocked by the Soldiers",
        mt: "27:27-31", // FIXME: 31a
        mk: "15:16-20a", // FIXME: 20a
    },
    {
        title: "The Road to Golgotha",
        mt: "27:31-32", // FIXME: 31b
        mk: "15:20-21", // FIXME: 20b
        lk: "23:26-32",
        jn: "19:17", // FIXME: 19:17a
    },
    {
        title: "The Crucifixion",
        mt: "27:33-37",
        mk: "15:22-26",
        lk: "23:33-34",
        jn: "19:17-27", // FIXME: 19:17b
    },
    {
        title: "Jesus Derided on the Cross",
        mt: "27:38-43",
        mk: "15:27-32", // FIXME: 15:32a
        lk: "23:35-38",
    },
    {
        title: "The Two Thieves",
        mt: "27:44",
        mk: "15:32", // FIXME: 15:32b
        lk: "23:39-43",
    },
    {
        title: "The Death of Jesus",
        mt: "27:45-54",
        mk: "15:33-39",
        lk: "23:44-48",
        jn: "19:28-30",
    },
    {
        title: "Witness of the Crucifixion",
        mt: "27:55-56",
        mk: "15:40-41",
        lk: "23:49",
    },
    {
        title: "The Burial of Jesus",
        mt: "27:57-61",
        mk: "15:42-47",
        lk: "23:50-56",
        jn: "19:38-42",
    },
    {
        title: "The Women at the Tomb",
        mt: "28:1-8",
        mk: "16:1-8",
        lk: "24:1-12",
        jn: "20:1-13",
    },
    {
        title: "Jesus Appears to the Women",
        mt: "28:9-10",
        mk: "16:9-11",
        jn: "20:14-18",
    },
    {
        title: "Jesus Appears to Two on the Way to Emmaus",
        mk: "16:12-13",
        lk: "24:13-35",
    },
    {
        title: "Jesus Appears to the Disciples (Thomas being Absent)",
        lk: "24:36-43",
        jn: "20:19-23",
    },
    {
        title: "The Ending of Luke: Jesus' Last Words and Ascension",
        mk: "16:15",
        lk: "24:44-53",
    },
];
