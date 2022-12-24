Consider the following things:

- Do I need a feature flag (how big is this feature)? - NO
- How to structure the required data and the relationship between data. The timestamp is **MUST**.
- Do I need real-time? - NO
- Do I need to run any migration? - YES, from the current homeConfigs to audio list, just manually edit the current data
- Who will be able to read the data?
- Who will be able to write the data?
- Do I need soft delete? - NO
- Do I need any reports? What metrics will I want to keep my eye on it? - NO

The output of this step should include:

- Data model with the data converter
- Firestore Security rules or Hasura metadata
- Nice to have: data flow documentation

## Data structure

```
interface Feeling {
  name: string;
  value: string;
}
interface Audio {
  src: string;
  name: string;
  artistName: string;
  image: string;
  uploaderId: string;
  updatedAt?: FieldValue;// ??
  editorId?: string;
  createdAt?: FieldValue;// ??
  feelings: {
    [key: string]: Feeling;// always true
  }
}


/audioList/${audioId}: Audio
/feelings/${feelingId}: Feeling
/audioByFeeling/${feelingId}/${audioId}: Audio
/homeConfigs/listen/feelingList/${feelingId}: Feeling
```

What is the data I need?

- List of feelings on the home page? => `/homeConfigs/listen/feelingList/`
- Click on each feeling, I can see list of audios => `${feelingId}` => `/audioByFeeling/${feelingId}/`

### Security rules

/audioList/: only admin can list and see items in this, only admin can write
/feelings/: only admin can list and see items in this, only admin can write
/audioByFeeling/: public read, only admin can write
/homeConfigs/listen/feelingList/: public read, only admin can write

## User stories

### Admin

List of features:

- Upload new audio into system
- Upload new feeling into system
- Choose audio to be displayed on the homepage
- Choose feeling to be displayed on the homepage

### End users

List of features:

- Listen all audios
- Filter audio by feelings

For signed in users:

- Choose audio to be displayed on the homepage
- Choose feeling to be displayed on the homepage
