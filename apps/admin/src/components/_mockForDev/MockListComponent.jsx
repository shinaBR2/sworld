import { Grid } from "@mui/material";

const MockListComponent = (props) => {
  const { data: itemList, onClickEdit } = props;

  return (
    <Grid container spacing={3}>
      {itemList &&
        itemList.map((item, index) => (
          <p key={item.id}>{`Item ${JSON.stringify(item)}, index: ${index}`}</p>
        ))}
    </Grid>
  );
};

export default MockListComponent;
