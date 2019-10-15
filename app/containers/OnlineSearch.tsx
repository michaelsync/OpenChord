import React, { useState, useEffect, FunctionComponent } from "react";
import { View, StyleSheet, Picker, TextInput } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import ListItem from "../components/ListItem";
import { NavigationStackProp, NavigationStackOptions } from "react-navigation-stack/lib/typescript/types";
import { NavigationScreenComponent } from "react-navigation";
import { services, getService } from "../services";
import { Doc } from "../services/BaseService";
import { Header } from "react-navigation-stack";
import SearchBar from "../components/SearchBar";
import SafeAreaView from "react-native-safe-area-view";

interface OnlineSearchProps {
  navigation: NavigationStackProp<{}, {}>
}

const OnlineSearch: FunctionComponent<OnlineSearchProps> & NavigationScreenComponent<
  NavigationStackOptions,
  NavigationStackProp
> = (props) => {
  const [baseServices] = useState(services)
  const [serviceName, setServiceName] = useState(services[0].name)
  const [docs, setDocs] = useState<Doc[]>([])
  const [query, setQuery] = useState('')

  async function makeSearch() {
    if (query.length > 2) {
      const fetchData = async () => {
        const docs = await getService(serviceName)!.getSearch(query)
        setDocs(docs)
      };
      fetchData();
    }
  }
  return (
    <SafeAreaView>
      <View style={styles.customHeader}>
        <Picker
          selectedValue={serviceName}
          style={styles.picker}
          onValueChange={(value) => setServiceName(value)}>
          {baseServices.map(service => {
            return <Picker.Item key={service.name} label={service.name} value={service.name} />
          })}
        </Picker>
      </View>
      <SearchBar
        onSubmitEditing={makeSearch}
        onChangeText={(value) => setQuery(value)}
        query={query}
      />
      <FlatList
        keyExtractor={(item) => item.path}
        data={docs}
        renderItem={({ item, index }) => {
          if (item.type == 'artist') {
            return (
              <ListItem
                onPress={() => { props.navigation.navigate('OnlineArtistView', { path: item.path, serviceName, title: item.name }) }}
                title={item.name}
              />)
          } else {
            return (
              <ListItem
                onPress={() => { props.navigation.navigate('SongPreview', { path: item.path, serviceName }) }}
                title={item.title}
                subtitle={item.artist}
              />)
          }
        }}
      />
    </SafeAreaView>
  );
}
export default OnlineSearch

const styles = StyleSheet.create({
  customHeader: {
    height: Header.HEIGHT,
    backgroundColor: 'white',
    elevation: 4,
    justifyContent: 'center'
  },
  picker: {
    marginHorizontal: 10
  }
});