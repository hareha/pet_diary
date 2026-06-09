import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  subtitle?: string;
  type?: 'navigate' | 'toggle' | 'danger';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface MenuListProps {
  title?: string;
  items: MenuItem[];
}

export default function MenuList({ title, items }: MenuListProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.list}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.item,
              index < items.length - 1 && styles.itemBorder,
            ]}
            onPress={item.type === 'toggle' ? undefined : item.onPress}
            disabled={item.type === 'toggle'}
            activeOpacity={item.type === 'toggle' ? 1 : 0.6}
          >
            <View style={styles.itemLeft}>
              {item.icon && <Text style={styles.icon}>{item.icon}</Text>}
              <View>
                <Text
                  style={[
                    styles.label,
                    item.type === 'danger' && styles.dangerLabel,
                  ]}
                >
                  {item.label}
                </Text>
                {item.subtitle && (
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            {item.type === 'toggle' ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#E8DDD0', true: '#E88D67' }}
                thumbColor="#FFFFFF"
              />
            ) : (
              <Text style={styles.arrow}>›</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 13,
    color: '#B0A090',
    fontFamily: 'Gaegu_700Bold',
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  list: {
    backgroundColor: '#FFFFF8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8DDD0',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0E8DD',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    color: '#5D4E3C',
    fontFamily: 'Gaegu_700Bold',
  },
  dangerLabel: {
    color: '#CC6B5A',
  },
  subtitle: {
    fontSize: 12,
    color: '#B0A090',
    fontFamily: 'Gaegu_400Regular',
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: '#C8BDB0',
    fontWeight: '300',
  },
});
