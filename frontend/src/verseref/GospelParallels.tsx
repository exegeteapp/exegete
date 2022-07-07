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
];
