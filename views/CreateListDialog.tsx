import { useState, forwardRef, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../data/store'
import { useRouter } from 'next/router';
import { Button, Dialog, Slide, TextField } from "@mui/material";
import { AppBar, IconButton, Toolbar, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { createList } from "../data/listSlice";
import { TransitionProps } from "@mui/material/transitions";
import DataService from "../services/DataService";
import { load } from "../data/armySlice";
import ArmyImage from "./components/ArmyImage";
import PersistenceService from "../services/PersistenceService";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateListDialog({ open, setOpen, showBetaFlag, customArmies }) {

  const army = useSelector((state: RootState) => state.army);
  const [armyName, setArmyName] = useState("");
  const [pointsLimit, setPointsLimit] = useState(null);
  const [useBeta, setUseBeta] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  // Update default name once data comes in
  useEffect(() => {
    if (!armyName && army.data && army.data.name)
      setArmyName(army.data.name);
  }, [army.data]);

  const create = () => {

    const finish = (army) => {
      const name = armyName || "My List";
      const saveExists = PersistenceService.checkExists(name);

      if (!saveExists || confirm("List with this name already exists. Are you sure you'd like to overwrite it?")) {

        PersistenceService.createSave(army, name);

        dispatch(createList({ name, pointsLimit: pointsLimit || 0 }));

        router.push('/list');
      }
    };

    if (useBeta) {

      const apiArmy = customArmies.filter(a => a.name === army.data.name && a.official)[0];

      DataService.getApiData(apiArmy.uid, afData => {

        dispatch(load(afData));

        finish({ ...army, data: afData });
      });

    } else {
      finish(army);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={() => setOpen(false)} TransitionComponent={Transition}>
      <AppBar position="static" elevation={0} color="transparent">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setOpen(false)}
          >
            <ClearIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {army.data?.name || "New Army"}
          </Typography>
        </Toolbar>
      </AppBar>
      <div>
        <div className="mx-auto" style={{ maxWidth: "480px" }}>
          <div className="is-flex is-flex-direction-column p-4 mx-auto">
            <div className="mb-6">
              <ArmyImage name={army.data?.name} />
            </div>
            <TextField variant="filled" label="List Name" className="mb-4" value={armyName} onChange={(e) => setArmyName(e.target.value)} />
            <TextField variant="filled" label="Points Limit" type="number" className="mb-4" value={pointsLimit} onChange={(e) => setPointsLimit(e.target.value ? parseInt(e.target.value) : null)} />
            {showBetaFlag && <FormGroup className="mb-4 is-flex-direction-row is-align-items-center">
              <FormControlLabel control={
                <Checkbox checked={useBeta} onClick={() => setUseBeta(!useBeta)} />
              } label="Use v2.5 Beta" />
            </FormGroup>}
            <Button variant="contained" onClick={() => create()}>Create List</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}