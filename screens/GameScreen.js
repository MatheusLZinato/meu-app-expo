import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import { useGame } from '../context/GameContext';
import Button from '../components/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.55;
const GROUND_HEIGHT = 70;
const PLAYER_SIZE = 50;
const PLAYER_X = 60;
const OBSTACLE_SIZE = 50;
const GRAVITY = 0.95;
const JUMP_VELOCITY = -16;
const OBSTACLE_SPEED = 6;
const GROUND_OBSTACLE_Y = GAME_AREA_HEIGHT - GROUND_HEIGHT - OBSTACLE_SIZE;
const FLYING_OBSTACLE_Y = GAME_AREA_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE - OBSTACLE_SIZE - 5;

const randomPokemonSprite = () => {
  const id = Math.floor(Math.random() * 151) + 1;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
};

export default function GameScreen({ navigation }) {
  const { selectedPokemon } = useGame();

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerY, setPlayerY] = useState(0);
  const [obstacles, setObstacles] = useState([]);

  const playerYRef = useRef(0);
  const playerVyRef = useRef(0);
  const obstaclesRef = useRef([]);
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const nextSpawnRef = useRef(60);

  const checkCollision = (a, b) => {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  };

  const jump = () => {
    if (!isPlaying || gameOver) return;
    if (playerYRef.current >= -2) {
      playerVyRef.current = JUMP_VELOCITY;
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId;

    const gameLoop = () => {
      frameCountRef.current += 1;

      playerVyRef.current += GRAVITY;
      playerYRef.current += playerVyRef.current;

      if (playerYRef.current > 0) {
        playerYRef.current = 0;
        playerVyRef.current = 0;
      }

      if (frameCountRef.current - lastSpawnRef.current >= nextSpawnRef.current) {
        lastSpawnRef.current = frameCountRef.current;
        nextSpawnRef.current = 50 + Math.floor(Math.random() * 80);
        const isFlying = Math.random() < 0.35;
        obstaclesRef.current.push({
          id: Date.now() + Math.random(),
          x: SCREEN_WIDTH,
          sprite: randomPokemonSprite(),
          isFlying,
          y: isFlying ? FLYING_OBSTACLE_Y : GROUND_OBSTACLE_Y,
        });
      }

      const playerBox = {
        x: PLAYER_X + 6,
        y: GAME_AREA_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE + playerYRef.current + 6,
        w: PLAYER_SIZE - 12,
        h: PLAYER_SIZE - 6,
      };

      let collided = false;
      obstaclesRef.current = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - OBSTACLE_SPEED }))
        .filter((o) => {
          if (o.x < -OBSTACLE_SIZE) return false;

          const obstacleBox = {
            x: o.x + 8,
            y: o.y + 8,
            w: OBSTACLE_SIZE - 16,
            h: OBSTACLE_SIZE - 6,
          };

          if (checkCollision(playerBox, obstacleBox)) {
            collided = true;
          }
          return true;
        });

      if (collided) {
        const finalScore = Math.floor(scoreRef.current / 6);
        setHighScore((prev) => (finalScore > prev ? finalScore : prev));
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      scoreRef.current += 1;
      setPlayerY(playerYRef.current);
      setObstacles([...obstaclesRef.current]);
      setScore(Math.floor(scoreRef.current / 6));

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  const startGame = () => {
    scoreRef.current = 0;
    playerYRef.current = 0;
    playerVyRef.current = 0;
    obstaclesRef.current = [];
    frameCountRef.current = 0;
    lastSpawnRef.current = 0;
    nextSpawnRef.current = 60;

    setScore(0);
    setPlayerY(0);
    setObstacles([]);
    setGameOver(false);
    setIsPlaying(true);
  };

  if (!selectedPokemon) {
    return (
      <View style={styles.selectContainer}>
        <Text style={styles.selectEmoji}>🎮</Text>
        <Text style={styles.selectTitle}>Escolha seu Pokémon!</Text>
        <Text style={styles.selectSubtitle}>
          Vá à Pokédex, toque em um Pokémon{'\n'}e pressione "Jogar com este Pokémon"
        </Text>
        <Button
          title="Ir para a Pokédex"
          onPress={() => navigation.navigate('Utilitário')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scoreBar}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>PONTOS</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        <View style={styles.pokemonBadge}>
          <Image source={{ uri: selectedPokemon.image }} style={styles.badgeImage} />
          <Text style={styles.badgeName}>{selectedPokemon.name}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>RECORDE</Text>
          <Text style={styles.scoreText}>{highScore}</Text>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={jump}>
        <View style={[styles.gameArea, { height: GAME_AREA_HEIGHT }]}>
          <View style={styles.sun} />
          <View style={[styles.ground, { top: GAME_AREA_HEIGHT - GROUND_HEIGHT }]} />

          <View
            style={[
              styles.player,
              {
                left: PLAYER_X,
                top: GAME_AREA_HEIGHT - GROUND_HEIGHT - PLAYER_SIZE + playerY,
              },
            ]}
          >
            <Image source={{ uri: selectedPokemon.image }} style={styles.playerImage} />
          </View>

          {obstacles.map((o) => (
            <View
              key={o.id}
              style={[
                styles.obstacle,
                { left: o.x, top: o.y },
              ]}
            >
              <Image source={{ uri: o.sprite }} style={styles.obstacleImage} />
            </View>
          ))}

          {!isPlaying && !gameOver && (
            <View style={styles.overlay}>
              <Image source={{ uri: selectedPokemon.image }} style={styles.overlayImage} />
              <Text style={styles.title}>{selectedPokemon.name}</Text>
              <Text style={styles.subtitle}>
                Desvie dos Pokémon inimigos!{'\n'}Toque na tela ou no botão PULAR
              </Text>
              <Button title="▶ Iniciar Jogo" onPress={startGame} />
            </View>
          )}

          {gameOver && (
            <View style={styles.overlay}>
              <Text style={styles.gameOverTitle}>💥 Game Over!</Text>
              <Text style={styles.finalScore}>{score} pontos</Text>
              {score === highScore && score > 0 && (
                <Text style={styles.newRecord}>🏆 Novo recorde!</Text>
              )}
              <Button title="↻ Jogar novamente" onPress={startGame} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.jumpButton, (!isPlaying || gameOver) && styles.jumpButtonDisabled]}
          onPress={jump}
          activeOpacity={0.7}
          disabled={!isPlaying || gameOver}
        >
          <Text style={styles.jumpText}>PULAR ⬆</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1d3557' },
  selectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1d3557',
    padding: 30,
  },
  selectEmoji: { fontSize: 64, marginBottom: 16 },
  selectTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  scoreBar: {
    flexDirection: 'row',
    backgroundColor: '#e63946',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreItem: { alignItems: 'center', minWidth: 70 },
  scoreLabel: { color: '#fff', fontSize: 11, letterSpacing: 1.5, opacity: 0.9 },
  scoreText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  pokemonBadge: { alignItems: 'center' },
  badgeImage: { width: 44, height: 44 },
  badgeName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  gameArea: {
    backgroundColor: '#fce5b8',
    position: 'relative',
    overflow: 'hidden',
  },
  sun: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffd166',
    opacity: 0.9,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: GROUND_HEIGHT,
    backgroundColor: '#d4a373',
    borderTopWidth: 3,
    borderTopColor: '#8b5a2b',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
  playerImage: { width: PLAYER_SIZE, height: PLAYER_SIZE },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE,
  },
  obstacleImage: { width: OBSTACLE_SIZE, height: OBSTACLE_SIZE },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(29,53,87,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: 20,
  },
  overlayImage: { width: 90, height: 90, marginBottom: 8 },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subtitle: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  gameOverTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  finalScore: {
    color: '#ffd166',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newRecord: {
    color: '#ffd166',
    fontSize: 16,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  controls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1d3557',
  },
  jumpButton: {
    width: 200,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e63946',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  jumpButtonDisabled: { backgroundColor: '#666', opacity: 0.5 },
  jumpText: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
});
